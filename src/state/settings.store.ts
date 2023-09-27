import { InternalServerException } from "@/exceptions/runtime.exceptions";
import {
  credentialSettingsKey,
  fileCleanSettingKey,
  frontendSettingKey,
  serverSettingsKey,
  timeoutSettingKey,
  wizardSettingKey,
} from "@/constants/server-settings.constants";
import { getCurrentHub } from "@sentry/node";
import { isTestEnvironment } from "@/utils/env.utils";
import { AppConstants } from "@/server.constants";
import { LoggerService } from "@/handlers/logger";
import { Settings } from "@/entities/mikro";
import { SettingsService2 } from "@/services/orm/settings.service";

export class SettingsStore {
  settingsService: SettingsService2;
  logger: LoggerService;
  private settings: Settings | null = null;

  constructor({ settingsService, loggerFactory }) {
    this.settingsService = settingsService;
    this.logger = loggerFactory(SettingsStore.name);
  }

  getSettings() {
    const settings = this.settings!;
    return Object.freeze({
      [serverSettingsKey]: settings[serverSettingsKey],
      [wizardSettingKey]: settings[wizardSettingKey],
      [frontendSettingKey]: settings[frontendSettingKey],
      [fileCleanSettingKey]: settings[fileCleanSettingKey],
      [timeoutSettingKey]: settings[timeoutSettingKey],
    });
  }

  async loadSettings() {
    // Setup Settings as connection is established
    this.settings = await this.settingsService.getOrCreate();
    await this.processSentryEnabled();
  }

  async getCredentialSettings() {
    return this.settings[credentialSettingsKey];
  }

  async getAnonymousDiagnosticsEnabled() {
    return this.settings[serverSettingsKey].sentryDiagnosticsEnabled;
  }

  async persistOptionalCredentialSettings(overrideJwtSecret: string, overrideJwtExpiresIn) {
    if (overrideJwtSecret) {
      await this.updateCredentialSettings({
        jwtSecret: overrideJwtSecret,
      });
    }
    if (overrideJwtExpiresIn) {
      await this.updateCredentialSettings({
        jwtExpiresIn: overrideJwtExpiresIn,
      });
    }
  }

  getWizardState() {
    return {
      wizardCompleted: this.settings[wizardSettingKey].wizardCompleted,
      wizardVersion: this.settings[wizardSettingKey].wizardVersion,
      latestWizardVersion: AppConstants.currentWizardVersion,
    };
  }

  isWizardCompleted() {
    return (
      this.settings[wizardSettingKey].wizardCompleted &&
      this.settings[wizardSettingKey].wizardVersion === AppConstants.currentWizardVersion
    );
  }

  getWizardSettings() {
    return this.settings[wizardSettingKey];
  }

  isRegistrationEnabled() {
    if (!this.settings) throw new InternalServerException("Could not check server settings (server settings not loaded");
    return this.settings[serverSettingsKey].registration;
  }

  getServerSettings() {
    return this.getSettings()[serverSettingsKey];
  }

  /**
   * Cross-cutting concern for file clean operation
   * @returns {*}
   */
  getFileCleanSettings() {
    return this.getSettings()[fileCleanSettingKey];
  }

  isPreUploadFileCleanEnabled() {
    return this.getSettings()[fileCleanSettingKey]?.autoRemoveOldFilesBeforeUpload;
  }

  /**
   * @param version {number}
   */
  async setWizardCompleted(version) {
    this.settings = await this.settingsService.patchWizardSettings({
      wizardCompleted: true,
      wizardCompletedAt: new Date(),
      wizardVersion: version,
    });
    return this.getSettings();
  }

  /**
   * @param {Boolean} enabled
   */
  async setRegistrationEnabled(registration = true) {
    this.settings = await this.settingsService.patchServerSettings({
      registration,
    });
    return this.getSettings();
  }

  async getLoginRequired() {
    return this.getServerSettings().loginRequired;
  }

  async setLoginRequired(loginRequired = true) {
    this.settings = await this.settingsService.patchServerSettings({
      loginRequired,
    });
    return this.getSettings();
  }

  async setWhitelist(whiteListEnabled = true, whiteListIpAddresses) {
    this.settings = await this.settingsService.patchServerSettings({
      whiteListEnabled,
      whiteListIpAddresses,
    });
    return this.getSettings();
  }

  async updateServerSettings(serverSettings) {
    this.settings = await this.settingsService.patchServerSettings(serverSettings);
    return this.getSettings();
  }

  async updateCredentialSettings(credentialSettings) {
    this.settings = await this.settingsService.updateCredentialSettings(credentialSettings);
    return this.getSettings();
  }

  async setSentryDiagnosticsEnabled(sentryDiagnosticsEnabled: boolean) {
    this.settings = await this.settingsService.patchServerSettings({
      sentryDiagnosticsEnabled,
    });
    await this.processSentryEnabled();
    return this.getSettings();
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  async processSentryEnabled() {
    if (isTestEnvironment()) return;
    const sentryEnabled = await this.getAnonymousDiagnosticsEnabled();
    if (sentryEnabled) {
      this.logger.log("Enabling Sentry for remote diagnostics");
    } else {
      this.logger.log("Disabling Sentry for remote diagnostics");
    }
    getCurrentHub().getClient()!.getOptions().enabled = sentryEnabled;
  }

  async updateFrontendSettings(frontendSettings) {
    this.settings = await this.settingsService.updateFrontendSettings(frontendSettings);
    return this.getSettings();
  }
}
