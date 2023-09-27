import {
  credentialSettingsKey,
  fileCleanSettingKey,
  frontendSettingKey,
  serverSettingsKey,
  timeoutSettingKey,
  wizardSettingKey,
} from "@/constants/server-settings.constants";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "@/entities/base.entity";

@Entity()
export class Settings extends BaseEntity {
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
    wizardCompletedAt: Date | null;
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
