const { EntitySchema } = require("@mikro-orm/core");

const serverSettingsKey = "server";
const credentialSettingsKey = "credentials";
const frontendSettingKey = "frontend";
const timeoutSettingKey = "timeout";

class Settings {
  constructor() {
    this[serverSettingsKey] = {
      sentryDiagnosticsEnabled: false,
      debugSettings: {
        debugSocketIoEvents: false,
        debugSocketReconnect: false,
        debugSocketRetries: false,
        debugSocketSetup: true,
        debugSocketMessages: false,
        debugSocketIoBandwidth: false,
      },
      loginRequired: false,
      whitelistEnabled: false,
      whitelistedIpAddresses: [],
      registration: true,
    };
    this[credentialSettingsKey] = {
      jwtSecret: "",
      jwtExpiresIn: 0,
      refreshTokenAttempts: 0,
      refreshTokenExpiry: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this[frontendSettingKey] = {
      gridCols: 8,
      gridRows: 8,
      largeTiles: false,
    };
    this[timeoutSettingKey] = {
      apiTimeout: 1000,
    };
  }
}

const SettingsSchema = new EntitySchema({
  class: Settings,
  properties: {
    id: { primary: true, type: "number" },
    [serverSettingsKey]: {
      type: "json",
      default: () => ({}),
    },
    [credentialSettingsKey]: {
      type: "json",
      default: () => ({}),
    },
    [frontendSettingKey]: {
      type: "json",
      default: () => ({}),
    },
    [timeoutSettingKey]: {
      type: "json",
      default: () => ({}),
    },
  },
});

module.exports.Settings = Settings;
module.exports.entity = Settings;
module.exports.schema = SettingsSchema;
