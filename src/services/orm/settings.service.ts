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

export class SettingsService2 extends BaseService(Settings) {
  async getOrCreate() {
    const settings = await this.getSettings();

    if (!settings) {
      const settings = this.repository.create({
        [serverSettingsKey]: getDefaultServerSettings(),
        [credentialSettingsKey]: getDefaultCredentialSettings(),
        [wizardSettingKey]: getDefaultWizardSettings(),
        [fileCleanSettingKey]: getDefaultFileCleanSettings(),
        [frontendSettingKey]: getDefaultFrontendSettings(),
        [timeoutSettingKey]: getDefaultTimeout(),
      });
      await this.em.persistAndFlush(settings);
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
    const settingsDoc = await this.getOrCreate();
    settingsDoc[serverSettingsKey] = serverSettings;
    await this.em.persistAndFlush(settingsDoc);
    return settingsDoc;
  }

  async updateCredentialSettings(credentialSettings) {
    const entity = await this.getOrCreate();
    entity[credentialSettingsKey] = credentialSettings;
    await this.em.persistAndFlush(entity);
    return entity;
  }

  async updateFileCleanSettings(fileCleanSettings) {
    const entity = await this.getOrCreate();
    entity[fileCleanSettingKey] = fileCleanSettings;
    await this.em.persistAndFlush(entity);
    return entity;
  }

  async updateFrontendSettings(frontendSettings) {
    const entity = await this.getOrCreate();
    entity[frontendSettingKey] = frontendSettings;
    await this.em.persistAndFlush(entity);
    return entity;
  }

  async updateTimeoutSettings(timeoutSettings) {
    const entity = await this.getOrCreate();
    entity[timeoutSettingKey] = timeoutSettings;
    await this.em.persistAndFlush(entity);
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
    await this.em.persistAndFlush(entity);
    return entity;
  }

  private async getSettings() {
    const settingsRows = await this.repository.findAll({ limit: 1 });
    if (!settingsRows?.length) {
      return null;
    }

    return settingsRows[0];
  }
}
