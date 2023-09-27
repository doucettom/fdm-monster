import mongoose, { connect } from "mongoose";
import { fetchMongoDBConnectionString, runMigrations } from "@/server.env";
import { DITokens } from "@/container.tokens";
import { AppConstants } from "@/server.constants";
import { LoggerService } from "@/handlers/logger";
import { TaskManagerService } from "@/services/task-manager.service";
import { ServerTasks } from "@/tasks";
import { MulterService } from "@/services/multer.service";
import { SettingsStore } from "@/state/settings.store";
import { FloorStore } from "@/state/floor.store";
import { PluginFirmwareUpdateService } from "@/services/octoprint/plugin-firmware-update.service";
import { ConfigService } from "@/services/config.service";
import { PrinterSocketStore } from "@/state/printer-socket.store";
import { FilesStore } from "@/state/files.store";
import { PermissionService } from "@/services/authentication/permission.service";
import { RoleService } from "@/services/authentication/role.service";
import { UserService } from "@/services/authentication/user.service";
import { PluginRepositoryCache } from "@/services/octoprint/plugin-repository.cache";
import { ClientBundleService } from "@/services/client-bundle.service";
import { SettingsService2 } from "@/services/orm/settings.service";
import { TypeormService } from "@/services/typeorm/typeorm.service";

export class BootTask {
  logger: LoggerService;
  taskManagerService: TaskManagerService;
  serverTasks: ServerTasks;
  settingsStore: SettingsStore;
  settingsService: SettingsService2;
  multerService: MulterService;
  printerSocketStore: PrinterSocketStore;
  filesStore: FilesStore;
  permissionService: PermissionService;
  roleService: RoleService;
  userService: UserService;
  pluginRepositoryCache: PluginRepositoryCache;
  floorStore: FloorStore;
  pluginFirmwareUpdateService: PluginFirmwareUpdateService;
  clientBundleService: ClientBundleService;
  configService: ConfigService;
  typeormService: TypeormService;

  constructor({
    loggerFactory,
    serverTasks,
    settingsService,
    settingsStore,
    multerService,
    printerSocketStore,
    filesStore,
    permissionService,
    roleService,
    userService,
    taskManagerService,
    pluginRepositoryCache,
    floorStore,
    pluginFirmwareUpdateService,
    clientBundleService,
    configService,
    typeormService,
  }) {
    this.serverTasks = serverTasks;
    this.settingsService = settingsService;
    this.settingsStore = settingsStore;
    this.multerService = multerService;
    this.printerSocketStore = printerSocketStore;
    this.filesStore = filesStore;
    this.permissionService = permissionService;
    this.roleService = roleService;
    this.userService = userService;
    this.taskManagerService = taskManagerService;
    this.pluginRepositoryCache = pluginRepositoryCache;
    this.floorStore = floorStore;
    this.pluginFirmwareUpdateService = pluginFirmwareUpdateService;
    this.logger = loggerFactory(BootTask.name);
    this.clientBundleService = clientBundleService;
    this.configService = configService;
    this.typeormService = typeormService;
  }

  async runOnce() {
    // To cope with retries after failures we register this task - disabled
    this.taskManagerService.registerJobOrTask(this.serverTasks.SERVER_BOOT_TASK);

    this.logger.log("Running boot task once.");
    await this.run();
  }

  async run() {
    await this.typeormService.createConnection();

    try {
      await this.createConnection();
      await this.migrateDatabase();
    } catch (e) {
      if (e instanceof mongoose.Error) {
        // Tests should just continue
        if (!e.message.includes("Can't call `openUri()` on an active connection with different connection strings.")) {
          // We are not in a test
          if (e.message.includes("ECONNREFUSED")) {
            this.logger.error("Database connection timed-out. Retrying in 5000.");
          } else {
            this.logger.error(`Database connection error: ${e.message}`);
          }
          this.taskManagerService.scheduleDisabledJob(DITokens.bootTask, false);
          return;
        }
      }
    }

    this.logger.log("Loading and synchronizing Server Settings");
    await this.settingsStore.loadSettings();

    this.logger.log("Synchronizing user permission and roles definition");
    await this.permissionService.syncPermissions();
    await this.roleService.syncRoles();

    const isDemoMode = this.configService.get(AppConstants.OVERRIDE_IS_DEMO_MODE, "false") === "true";
    if (isDemoMode) {
      this.logger.warn("Starting in demo mode due to OVERRIDE_IS_DEMO_MODE");
      await this.createOrUpdateDemoAccount();
    }

    const loginRequired = this.configService.get(AppConstants.OVERRIDE_LOGIN_REQUIRED, "false") === "true";
    await this.settingsStore.setLoginRequired(loginRequired);

    // If we are in demo mode, do not allow registration
    const registrationEnabled = isDemoMode
      ? false
      : this.configService.get(AppConstants.OVERRIDE_REGISTRATION_ENABLED, "false") === "true";
    await this.settingsStore.setRegistrationEnabled(registrationEnabled);

    const overrideJwtSecret = this.configService.get(AppConstants.OVERRIDE_JWT_SECRET, undefined);
    const overrideJwtExpiresIn = this.configService.get(AppConstants.OVERRIDE_JWT_EXPIRES_IN, undefined);
    await this.settingsStore.persistOptionalCredentialSettings(overrideJwtSecret, overrideJwtExpiresIn);

    this.logger.log("Clearing upload folder");
    this.multerService.clearUploadsFolder();
    this.logger.log("Loading printer sockets");
    await this.printerSocketStore.loadPrinterSockets(); // New sockets
    this.logger.log("Loading files store");
    await this.filesStore.loadFilesStore();
    this.logger.log("Loading floor store");
    await this.floorStore.loadStore();

    if (process.env.SAFEMODE_ENABLED === "true") {
      this.logger.warn("Starting in safe mode due to SAFEMODE_ENABLED");
    } else {
      this.serverTasks.BOOT_TASKS.forEach((task) => {
        this.taskManagerService.registerJobOrTask(task);
      });
    }

    // Success so we disable this task
    this.taskManagerService.disableJob(DITokens.bootTask, false);
  }

  async createOrUpdateDemoAccount() {
    const demoUsername = this.configService.get(AppConstants.OVERRIDE_DEMO_USERNAME, AppConstants.DEFAULT_DEMO_USERNAME);
    const demoPassword = this.configService.get(AppConstants.OVERRIDE_DEMO_PASSWORD, AppConstants.DEFAULT_DEMO_PASSWORD);
    const demoRole = this.configService.get(AppConstants.OVERRIDE_DEMO_ROLE, AppConstants.DEFAULT_DEMO_ROLE);
    const adminRole = this.roleService.getRoleByName(demoRole);

    const demoUserId = await this.userService.getDemoUserId();
    if (!demoUserId) {
      await this.userService.register({
        username: demoUsername,
        password: demoPassword,
        isDemoUser: true,
        needsPasswordChange: false,
        roles: [adminRole.id],
      });
      this.logger.log("Created demo account");
    } else {
      await this.userService.updatePasswordUnsafe(demoUsername, demoPassword);
      await this.userService.setUserRoleIds(demoUserId, [adminRole.id]);
      this.logger.log("Updated demo account");
    }

    await this.settingsStore.setWizardCompleted(1);
  }

  async createConnection() {
    await connect(fetchMongoDBConnectionString(), {
      serverSelectionTimeoutMS: 1500,
    });
  }

  async migrateDatabase() {
    await runMigrations(mongoose.connection.db, mongoose.connection.getClient());
  }
}
