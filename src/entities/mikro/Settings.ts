import { BaseEntity } from "@/entities/mikro/BaseEntity";
import {
  credentialSettingsKey,
  fileCleanSettingKey,
  frontendSettingKey,
  serverSettingsKey,
  timeoutSettingKey,
  wizardSettingKey,
} from "@/constants/server-settings.constants";
import { Entity, Property } from "@mikro-orm/core";

@Entity()
export class Settings extends BaseEntity {
  @Property({ type: "json", nullable: false })
  [serverSettingsKey]!: {
    sentryDiagnosticsEnabled: boolean;
    debugSettings: {
      debugSocketIoEvents: boolean;
      debugSocketReconnect: boolean;
      debugSocketRetries: boolean;
      debugSocketSetup: boolean;
      debugSocketMessages: boolean;
      debugSocketIoBandwidth: boolean;
    };
    loginRequired: boolean;
    registration: boolean;
    whitelistEnabled: boolean;
    whitelistedIpAddresses: string[];
  };

  @Property({ type: "json", nullable: false })
  [credentialSettingsKey]!: {
    jwtSecret: string; // minlength: 10, trim
    jwtExpiresIn: number;
    refreshTokenAttempts: number;
    refreshTokenExpiry: number;
  };

  @Property({ type: "json", nullable: false })
  [wizardSettingKey]!: {
    wizardCompleted: boolean;
    wizardCompletedAt: Date;
    wizardVersion: number;
  };

  @Property({ type: "json", nullable: false })
  [fileCleanSettingKey]!: {
    autoRemoveOldFilesBeforeUpload: boolean;
    autoRemoveOldFilesAtBoot: boolean;
    autoRemoveOldFilesCriteriumDays: number;
  };

  @Property({ type: "json", nullable: false })
  [frontendSettingKey]!: {
    gridCols: number;
    gridRows: number;
    largeTiles: boolean;
  };

  @Property({ type: "json", nullable: false })
  [timeoutSettingKey]!: {
    apiTimeout: number;
  };
}
