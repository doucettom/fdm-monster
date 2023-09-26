import { Settings } from "@/entities";
import {
  credentialSettingsKey,
  fileCleanSettingKey,
  frontendSettingKey,
  getDefaultCredentialSettings,
  getDefaultFileCleanSettings,
  getDefaultFrontendSettings,
  getDefaultServerSettings,
  getDefaultTimeout,
  getDefaultWizardSettings,
  serverSettingsKey,
  timeoutSettingKey,
  wizardSettingKey,
} from "@/constants/server-settings.constants";
import { BaseService } from "@/services/orm/base.service";
import { NotFoundException } from "@/exceptions/runtime.exceptions";

export interface SettingsDto {
  // TODO model
  id: number;
  [serverSettingsKey]: any;
  [frontendSettingKey]: any;
  [fileCleanSettingKey]: any;
  [credentialSettingsKey]: any;
  [wizardSettingKey]: any;
  [timeoutSettingKey]: any;
}

export class SettingsService2 extends BaseService<Settings, SettingsDto>(Settings) {
  toDto(entity: Settings): SettingsDto {
    return {
      id: entity.id,
      [serverSettingsKey]: entity[serverSettingsKey],
      [frontendSettingKey]: entity[frontendSettingKey],
      [fileCleanSettingKey]: entity[fileCleanSettingKey],
      [credentialSettingsKey]: entity[credentialSettingsKey],
      [wizardSettingKey]: entity[wizardSettingKey],
      [timeoutSettingKey]: entity[timeoutSettingKey],
    };
  }

  async getOrCreate() {
    const settings = await this.get();

    if (!settings) {
      const settings = this.create({
        [serverSettingsKey]: getDefaultServerSettings(),
        [credentialSettingsKey]: getDefaultCredentialSettings(),
        [wizardSettingKey]: getDefaultWizardSettings(),
        [fileCleanSettingKey]: getDefaultFileCleanSettings(),
        [frontendSettingKey]: getDefaultFrontendSettings(),
        [timeoutSettingKey]: getDefaultTimeout(),
      });
      return settings;
    }

    return settings;
  }

  async getServerSettings() {
    const settings = await this.getOrCreate();
    return settings[serverSettingsKey];
  }

  async patchServerSettings(serverSettingsPartial) {
    const entity = await this.getOrCreate();
    if (!entity[serverSettingsKey]) {
      throw new Error("No existing server settings found, cant patch");
    }

    const newServerSettings = {
      ...entity[serverSettingsKey],
      ...serverSettingsPartial,
    };

    return await this.updateServerSettings(newServerSettings);
  }

  async updateServerSettings(serverSettings) {
    const entity = await this.getOrCreate();
    entity[serverSettingsKey] = serverSettings;
    await this.update(entity.id, entity);
    return entity;
  }

  async updateCredentialSettings(credentialSettings) {
    const entity = await this.getOrCreate();
    entity[credentialSettingsKey] = credentialSettings;
    await this.update(entity.id, entity);
    return entity;
  }

  async updateFileCleanSettings(fileCleanSettings) {
    const entity = await this.getOrCreate();
    entity[fileCleanSettingKey] = fileCleanSettings;
    await this.update(entity.id, entity);
    return entity;
  }

  async updateFrontendSettings(frontendSettings) {
    const entity = await this.getOrCreate();
    entity[frontendSettingKey] = frontendSettings;
    await this.update(entity.id, entity);
    return entity;
  }

  async updateTimeoutSettings(timeoutSettings) {
    const entity = await this.getOrCreate();
    entity[timeoutSettingKey] = timeoutSettings;
    await this.update(entity.id, entity);
    return entity;
  }

  async patchWizardSettings(wizardSettingsPartial) {
    const entity = await this.getOrCreate();
    if (!entity[wizardSettingKey]) {
      throw new Error("No existing wizard settings found, cant patch");
    }

    const newWizardSettings = {
      ...entity[wizardSettingKey],
      ...wizardSettingsPartial,
    };

    return await this.updateWizardSettings(newWizardSettings);
  }

  async updateWizardSettings(wizardSettings) {
    const entity = await this.getOrCreate();
    entity[wizardSettingKey] = wizardSettings;
    await this.update(entity.id, entity);
    return entity;
  }

  async get() {
    const settingsList = await this.repository.find({ take: 1 });
    return settingsList?.length ? settingsList[0] : null;
  }
}
