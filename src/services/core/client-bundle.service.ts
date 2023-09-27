import AdmZip from "adm-zip";
import { join } from "path";
import { existsSync, writeFileSync } from "node:fs";
import { readdir, rm } from "node:fs/promises";
import { ensureDirExists, superRootPath } from "@/utils/fs.utils";
import { checkVersionSatisfiesMinimum } from "@/utils/semver.utils";
import { AppConstants } from "@/server.constants";
import { GithubService } from "@/services/core/github.service";
import { ConfigService } from "@/services/core/config.service";
import { LoggerService } from "@/handlers/logger";

export class ClientBundleService {
  githubService: GithubService;
  configService: ConfigService;
  logger: LoggerService;

  constructor({
    githubService,
    configService,
    loggerFactory,
  }: {
    githubService: GithubService;
    configService: ConfigService;
    loggerFactory: (name: string) => LoggerService;
  }) {
    this.githubService = githubService;
    this.configService = configService;
    this.logger = loggerFactory(ClientBundleService.name);
  }

  get clientPackageJsonPath() {
    return join(superRootPath(), AppConstants.defaultClientBundleStorage, "package.json");
  }

  get clientIndexHtmlPath() {
    return join(superRootPath(), AppConstants.defaultClientBundleStorage, "dist/index.html");
  }

  async getReleases() {
    const githubOwner = AppConstants.orgName;
    const githubRepo = AppConstants.clientRepoName;
    const result = await this.githubService.getReleases(githubOwner, githubRepo);
    const latestResult = await this.githubService.getLatestRelease(githubOwner, githubRepo);
    return {
      minimum: {
        tag_name: AppConstants.defaultClientMinimum,
      },
      current: {
        tag_name: this.getClientVersion(),
      },
      latest: latestResult.data,
      releases: result.data,
    };
  }

  async shouldUpdateWithReason(
    overrideAutoUpdate: boolean,
    minimumVersion: string
  ): Promise<{ reason: string; shouldUpdate: boolean }> {
    const clientAutoUpdate = AppConstants.enableClientDistAutoUpdateKey;
    if (!clientAutoUpdate && !overrideAutoUpdate) {
      return {
        shouldUpdate: false,
        reason: "Client auto-update disabled (ENABLE_CLIENT_DIST_AUTO_UPDATE), skipping",
      };
    }

    const version = this.getClientVersion();
    // If no package.json found, we should update to latest/minimum
    if (!version) {
      return {
        shouldUpdate: true,
        reason: `Client package.json does not exist, downloading new release`,
      };
    }

    if (!this.doesClientIndexHtmlExist()) {
      return {
        shouldUpdate: true,
        reason: `Client index.html does not exist, downloading new release`,
      };
    }

    // If no bundle found, this task should run to ensure one is downloaded
    const satisfiesMinimumVersion = checkVersionSatisfiesMinimum(version, minimumVersion);
    if (satisfiesMinimumVersion) {
      return {
        shouldUpdate: false,
        reason: `Client satisfies minimum version ${minimumVersion}, skipping`,
      };
    }

    return {
      shouldUpdate: true,
      reason: `Client bundle release ${version} does not satisfy minimum version ${minimumVersion}, downloading new release`,
    };
  }

  async downloadClientUpdate(releaseTag: string): Promise<void> {
    const release = await this.getClientBundleRelease(releaseTag);
    this.logger.log(
      `Retrieved ${release.assets.length} assets from release '${release.name}': ${release.assets.map((a) => a.name)}`
    );

    const asset = release.assets.find((a) => a.name === `dist-client-${release.tag_name}.zip`);
    const assetId = asset.id;
    const downloadPath = await this.downloadClientBundleZip(assetId, asset.name);
    await this.extractClientBundleZip(downloadPath);
  }

  private async getClientBundleRelease(releaseTag: string): Promise<{ assets: any[] }> {
    const githubOwner = AppConstants.orgName;
    const githubRepo = AppConstants.clientRepoName;

    const result = await this.githubService.getReleaseByTag(githubOwner, githubRepo, releaseTag);
    return result.data;
  }

  private async downloadClientBundleZip(assetId: any, assetName: string): Promise<string | any> {
    const githubOwner = AppConstants.orgName;
    const githubRepo = AppConstants.clientRepoName;
    const assetResult = await this.githubService.requestAsset(githubOwner, githubRepo, assetId);
    const dir = join(superRootPath(), AppConstants.defaultClientBundleZipsStorage);
    ensureDirExists(dir);
    this.logger.log(`Downloaded client release ZIP to '${dir}'. Extracting archive now`);
    const path = join(dir, assetName);
    writeFileSync(path, Buffer.from(assetResult.data));

    return path;
  }

  private async extractClientBundleZip(downloadedZipPath: string): Promise<void> {
    const zip = new AdmZip(downloadedZipPath);

    const distPath = join(superRootPath(), AppConstants.defaultClientBundleStorage);
    ensureDirExists(distPath);

    this.logger.debug(`Clearing contents of ${distPath}`);
    for (const fileOrDir of await readdir(distPath)) {
      this.logger.log(`Removing existing file/dir '${distPath}/${fileOrDir}' before updating client`);
      try {
        await rm(join(distPath, fileOrDir), { force: true, recursive: true });
      } catch (e) {
        this.logger.error(`${e.message} ${e.stack}`);
        throw e;
      }
    }
    try {
      zip.extractAllTo(join(superRootPath(), AppConstants.defaultClientBundleStorage));
    } catch (e) {
      this.logger.error(`Unzipping failed ${e.message} ${e.stack}`);
      throw e;
    }
    this.logger.log(`Successfully extracted client dist to ${distPath}`);
  }

  private doesClientIndexHtmlExist(): boolean {
    const indexHtmlPath = this.clientIndexHtmlPath;
    return existsSync(indexHtmlPath);
  }

  private getClientVersion(): string | null {
    const packageJsonPath = this.clientPackageJsonPath;
    const packageJsonFound = existsSync(packageJsonPath);
    // If no package.json found, we should update to latest/minimum
    if (!packageJsonFound) {
      return;
    }

    require.cache[packageJsonPath] = undefined;
    const json = require(packageJsonPath);
    return json?.version;
  }
}
