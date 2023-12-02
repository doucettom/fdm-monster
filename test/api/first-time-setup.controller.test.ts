import { FirstTimeSetupController } from "@/controllers/first-time-setup.controller";
import supertest from "supertest";
import { setupTestApp } from "../test-server";
import { AppConstants } from "@/server.constants";
import { AwilixContainer } from "awilix";
import { DITokens } from "@/container.tokens";
import { SettingsStore } from "@/state/settings.store";
import { expectForbiddenResponse, expectOkResponse } from "../extensions";
import { IUserService } from "@/services/interfaces/user-service.interface";
import { ISettingsService } from "@/services/interfaces/settings.service.interface";
import { TypeormService } from "@/services/typeorm/typeorm.service";
import { User } from "@/entities";
import { Repository } from "typeorm";

let request: supertest.SuperTest<supertest.Test>;
let container: AwilixContainer;
let settingsService: ISettingsService;
let settingsStore: SettingsStore;
let userRepository: Repository<User>;
let typeormService: TypeormService;
const completeSetupRoute = `${AppConstants.apiRoute}/first-time-setup/complete`;

beforeAll(async () => {
  ({ request, container, typeormService } = await setupTestApp(true));
  settingsService = container.resolve<ISettingsService>(DITokens.settingsService);
  settingsStore = container.resolve<SettingsStore>(DITokens.settingsStore);
  userRepository = typeormService.getDataSource().getRepository(User);
});

describe(FirstTimeSetupController.name, () => {
  const completeSetup = async (input: any) => await request.post(completeSetupRoute).send(input);
  const resetWizard = async () => {
    await settingsService.patchWizardSettings({
      wizardCompleted: false,
      wizardCompletedAt: null,
      wizardVersion: 0,
    });
    await settingsStore.loadSettings();
  };

  it("should complete first-time-setup", async () => {
    const userService = container.resolve<IUserService>(DITokens.userService);
    expect(await userService.listUsers()).toHaveLength(0);
    await resetWizard();
    expect(settingsStore.isWizardCompleted()).toBeFalsy();

    const response = await completeSetup({
      loginRequired: true,
      registration: true,
      rootUsername: "test",
      rootPassword: "testtest",
    });
    expectOkResponse(response);
    expect(settingsStore.isWizardCompleted()).toBeTruthy();
  });

  it("should not complete first-time-setup twice", async () => {
    await resetWizard();
    expect(settingsStore.isWizardCompleted()).toBeFalsy();
    await userRepository.delete({});
    const response = await completeSetup({
      loginRequired: true,
      registration: true,
      rootUsername: "test",
      rootPassword: "testtest",
    });
    expectOkResponse(response);
    expect(settingsStore.isWizardCompleted()).toBeTruthy();
    const response2 = await completeSetup({
      loginRequired: true,
      registration: true,
      rootUsername: "test",
      rootPassword: "testtest",
    });
    expectForbiddenResponse(response2);
  });
});
