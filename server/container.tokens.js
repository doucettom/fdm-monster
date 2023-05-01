const DITokens = {
  // Values
  serverVersion: "serverVersion",
  defaultRole: "defaultRole",
  // Instances
  serverHost: "serverHost",
  loggerFactory: "loggerFactory",
  httpClient: "httpClient",
  socketIoGateway: "socketIoGateway",
  simpleGitService: "simpleGitService",
  multerService: "multerService",
  configService: "configService",
  taskManagerService: "taskManagerService",
  toadScheduler: "toadScheduler",
  eventEmitter2: "eventEmitter2",
  cacheManager: "cacheManager",
  printerService: "printerService",
  printCompletionService: "printCompletionService",
  floorService: "floorService",
  yamlService: "yamlService",
  serverSettingsService: "serverSettingsService",
  serverReleaseService: "serverReleaseService",
  serverUpdateService: "serverUpdateService",
  githubApiService: "githubApiService",
  octokitService: "octokitService",
  clientBundleService: "clientBundleService",
  userTokenService: "userTokenService",
  userService: "userService",
  permissionService: "permissionService",
  roleService: "roleService",
  octoPrintApiService: "octoPrintApiService",
  pluginRepositoryCache: "pluginRepositoryCache",
  pluginFirmwareUpdateService: "pluginFirmwareUpdateService",
  influxDbV2BaseService: "influxDbV2BaseService",
  systemInfoBundleService: "systemInfoBundleService",
  printerFilesService: "printerFilesService",
  customGCodeService: "customGCodeService",
  // Stores/states
  settingsStore: "settingsStore",
  printerStore: "printerStore",
  octoPrintLogsCache: "printerTickerStore",
  filesStore: "filesStore",
  printerStateFactory: "printerStateFactory",
  printerState: "printerState",
  // Caches
  floorStore: "floorStore",
  jobsCache: "jobsCache",
  fileCache: "fileCache",
  fileUploadTrackerCache: "fileUploadTrackerCache",
  // Tasks
  serverTasks: "serverTasks",
  bootTask: "bootTask",
  printerSystemTask: "printerSystemTask",
  softwareUpdateTask: "softwareUpdateTask",
  printerSocketIoTask: "printerSocketIoTask",
  printCompletionSocketIoTask: "printCompletionSocketIoTask",
  printerTestTask: "printerTestTask",
  printerWebsocketTask: "printerWebsocketTask",
  printerWebsocketPingTask: "printerWebsocketPingTask",
  printerFileCleanTask: "printerFileCleanTask",
  pluginFirmwareUpdatePreparationTask: "PluginFirmwareUpdatePreparationTask",
};

module.exports = DITokens;
