import { BaseEntity } from "@/entities/mikro/BaseEntity";
import {
  credentialSettingsKey,
  fileCleanSettingKey,
  frontendSettingKey,
  serverSettingsKey,
  timeoutSettingKey,
  wizardSettingKey,
} from "@/constants/server-settings.constants";
import { Entity, Column } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Settings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "simple-json", nullable: false })
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

  @Column({ type: "simple-json", nullable: false })
  [credentialSettingsKey]!: {
    jwtSecret: string; // minlength: 10, trim
    jwtExpiresIn: number;
    refreshTokenAttempts: number;
    refreshTokenExpiry: number;
  };

  @Column({ type: "simple-json", nullable: false })
  [wizardSettingKey]!: {
    wizardCompleted: boolean;
    wizardCompletedAt: Date;
    wizardVersion: number;
  };

  @Column({ type: "simple-json", nullable: false })
  [fileCleanSettingKey]!: {
    autoRemoveOldFilesBeforeUpload: boolean;
    autoRemoveOldFilesAtBoot: boolean;
    autoRemoveOldFilesCriteriumDays: number;
  };

  @Column({ type: "simple-json", nullable: false })
  [frontendSettingKey]!: {
    gridCols: number;
    gridRows: number;
    largeTiles: boolean;
  };

  @Column({ type: "simple-json", nullable: false })
  [timeoutSettingKey]!: {
    apiTimeout: number;
  };
}
