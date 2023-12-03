import { asClass, asValue, AwilixContainer } from "awilix";
import { DITokens } from "@/container.tokens";
import { setupServer } from "@/server.core";
import { setupEnvConfig } from "@/server.env";
import { AxiosMock } from "./mocks/axios.mock";
import { OctoPrintApiMock } from "./mocks/octoprint-api.mock";
import { ROLES } from "@/constants/authorization.constants";
import supertest from "supertest";
import { Express } from "express";
import { AppConstants } from "@/server.constants";
import { TypeormService } from "@/services/typeorm/typeorm.service";
import { TaskManagerService } from "@/services/core/task-manager.service";

jest.mock("../src/utils/env.utils", () => ({
  ...jest.requireActual("../src/utils/env.utils"),
  writeVariableToEnvFile: jest.fn(),
}));
require("../src/utils/env.utils");

export async function setupTestApp(
  loadPrinterStore = false,
  mocks: any = undefined,
  quick_boot = true
): Promise<{
  container: AwilixContainer;
  httpServer: Express;
  httpClient: AxiosMock;
  request: supertest.SuperTest<supertest.Test>;
  octoPrintApiService: OctoPrintApiMock;
  typeormService: TypeormService;
  [k: string]: any;
}> {
  setupEnvConfig(true);

  const { httpServer, container } = await setupServer();
  container.register({
    [DITokens.octoPrintApiService]: asClass(OctoPrintApiMock).singleton(),
    [DITokens.httpClient]: asClass(AxiosMock).singleton(),
    [DITokens.appDefaultRole]: asValue(ROLES.ADMIN),
    [DITokens.appDefaultRoleNoLogin]: asValue(ROLES.ADMIN),
  });

  // Overrides get last pick
  if (mocks) container.register(mocks);

  // Setup database in memory - needed for loading settings etc
  const typeormService = container.resolve<TypeormService>(DITokens.typeormService);
  await typeormService.createConnection();

  // Setup
  const settingsStore = container.resolve(DITokens.settingsStore);
  await settingsStore.loadSettings();

  const serverHost = container.resolve(DITokens.serverHost);
  await serverHost.boot(httpServer, quick_boot, false);

  await settingsStore.setWizardCompleted(AppConstants.currentWizardVersion);
  await settingsStore.setLoginRequired(false);
  await container.resolve(DITokens.permissionService).syncPermissions();
  await container.resolve(DITokens.roleService).syncRoles();

  if (loadPrinterStore) {
    // Requires (in-memory) database connection, so its optional
    const printerSocketStore = container.resolve(DITokens.printerSocketStore);
    await printerSocketStore.loadPrinterSockets();
  }

  const isTypeormMode = container.resolve(DITokens.isTypeormMode);
  return {
    idType: isTypeormMode ? Number : String,
    isTypeormMode,
    httpServer,
    request: supertest(httpServer),
    container,
    httpClient: container.resolve<AxiosMock>(DITokens.httpClient),
    [DITokens.octoPrintApiService]: container.resolve<OctoPrintApiMock>(DITokens.octoPrintApiService),
    [DITokens.taskManagerService]: container.resolve<TaskManagerService>(DITokens.taskManagerService),
    [DITokens.typeormService]: container.resolve<TypeormService>(DITokens.typeormService),
  };
}
