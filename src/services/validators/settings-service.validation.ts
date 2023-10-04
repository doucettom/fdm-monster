export const serverSettingsUpdateRules = {
  registration: "boolean",
  loginRequired: "boolean",
  debugSettings: "object",
  "debugSettings.debugSocketEvents": "boolean",
  "debugSettings.debugSocketReconnect": "boolean",
};

export const frontendSettingsUpdateRules = {
  gridCols: "integer|min:1",
  gridRows: "integer|min:1",
  largeTiles: "boolean",
};

export const credentialSettingPatchRules = {
  jwtSecret: "string",
  jwtExpiresIn: "integer|min:120",
  refreshTokenAttempts: "integer|min:-1",
  refreshTokenExpiry: "integer|min:0",
};

export const whitelistSettingUpdateRules = {
  whitelistedIpAddresses: "required|array|minLength:1",
  "whitelistedIpAddresses.*": "required|string",
  whitelistEnabled: "required|boolean",
};

export const wizardUpdateRules = {
  wizardCompleted: "required|boolean",
  wizardCompletedAt: "required|date",
  wizardVersion: "required|integer|min:0",
};

export const fileCleanSettingsUpdateRules = {
  autoRemoveOldFilesBeforeUpload: "required|boolean",
  autoRemoveOldFilesAtBoot: "required|boolean",
  autoRemoveOldFilesCriteriumDays: "required|integer|min:0",
};

export const sentryDiagnosticsEnabledRules = {
  enabled: "required|boolean",
};
