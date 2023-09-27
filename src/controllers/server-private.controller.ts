import { PassThrough } from "stream";
import { createController, updateState } from "awilix-express";
import { authenticate, authorizeRoles } from "@/middleware/authenticate";
import { LoggerService as Logger } from "../handlers/logger";
import { AppConstants } from "@/server.constants";
import { ROLES } from "@/constants/authorization.constants";
import { isTestEnvironment } from "@/utils/env.utils";
import { validateMiddleware } from "@/handlers/validators";
import { ServerReleaseService } from "@/services/core/server-release.service";
import { ClientBundleService } from "@/services/core/client-bundle.service";
import { ServerUpdateService } from "@/services/core/server-update.service";
import { PrinterService } from "@/services/printer.service";
import { PrinterSocketStore } from "@/state/printer-socket.store";
import { PrinterCache } from "@/state/printer.cache";
import { YamlService } from "@/services/yaml.service";
import { MulterService } from "@/services/core/multer.service";
import { LogDumpService } from "@/services/core/logs-manager.service";

export class ServerPrivateController {
  clientBundleService: ClientBundleService;
  printerCache: PrinterCache;
  printerService: PrinterService;
  printerSocketStore: PrinterSocketStore;
  yamlService: YamlService;
  multerService: MulterService;
  logDumpService: LogDumpService;
  private logger = new Logger(ServerPrivateController.name);
  private serverUpdateService: ServerUpdateService;
  private serverReleaseService: ServerReleaseService;

  constructor({
    serverUpdateService,
    serverReleaseService,
    printerCache,
    printerService,
    clientBundleService,
    logDumpService,
    printerSocketStore,
    yamlService,
    multerService,
  }) {
    this.serverReleaseService = serverReleaseService;
    this.serverUpdateService = serverUpdateService;
    this.clientBundleService = clientBundleService;
    this.logDumpService = logDumpService;
    this.printerSocketStore = printerSocketStore;
    this.printerCache = printerCache;
    this.printerService = printerService;
    this.yamlService = yamlService;
    this.multerService = multerService;
  }

  async getClientReleases(req, res) {
    const releaseSpec = await this.clientBundleService.getReleases();
    res.send(releaseSpec);
  }

  async updateClientBundleGithub(req, res) {
    const inputRules = {
      tag_name: "required|string",
    };
    const { tag_name } = await validateMiddleware(req, inputRules, res);
    await this.clientBundleService.downloadClientUpdate(tag_name);

    res.send({
      executed: true,
      installed: tag_name,
    });
  }

  async getReleaseStateInfo(req, res) {
    await this.serverReleaseService.syncLatestRelease(false);
    const updateState = this.serverReleaseService.getState();
    res.send(updateState);
  }

  async pullGitUpdates(req, res) {
    const result = await this.serverUpdateService.checkGitUpdates();
    res.send(result);
  }

  async restartServer(req, res) {
    if (!isTestEnvironment()) {
      this.logger.warn("Server restart command fired. Expect the server to be unavailable for a moment");
    }
    const result = await this.serverUpdateService.restartServer();
    res.send(result);
  }

  async importPrintersAndFloorsYaml(req, res) {
    const files = await this.multerService.multerLoadFileAsync(req, res, ".yaml", false);
    const firstFile = files[0];
    const spec = await this.yamlService.importPrintersAndFloors(firstFile.buffer.toString());

    res.send({
      success: true,
      spec,
    });
  }

  async exportPrintersAndFloorsYaml(req, res) {
    const yaml = await this.yamlService.exportPrintersAndFloors(req.body);
    const fileContents = Buffer.from(yaml);
    const readStream = new PassThrough();
    readStream.end(fileContents);

    const fileName = `export-${AppConstants.serverRepoName}-` + Date.now() + ".yaml";
    res.set("Content-disposition", "attachment; filename=" + fileName);
    res.set("Content-Type", "text/plain");
    readStream.pipe(res);
  }

  async deleteAllPrinters(req, res) {
    const printers = await this.printerCache.listCachedPrinters(true);
    const printerIds = printers.map((p) => p.id);
    await this.printerService.deleteMany(printerIds);
    res.send();
  }

  async clearLogs(req, res) {
    const counts = await this.logDumpService.deleteOlderThanWeekAndMismatchingLogFiles();
    res.send(counts);
  }

  async dumpLogZips(req, res) {
    const filePath = await this.logDumpService.dumpZip();
    res.sendFile(filePath);
  }
}

// prettier-ignore
export default createController(ServerPrivateController)
  .prefix(AppConstants.apiRoute + "/server")
  .before([authenticate(), authorizeRoles([ROLES.ADMIN])])
  .get("/", "getReleaseStateInfo")
  .get("/client-releases", "getClientReleases")
  .post("/update-client-bundle-github", "updateClientBundleGithub")
  .post("/export-printers-floors-yaml", "exportPrintersAndFloorsYaml")
  .post("/import-printers-floors-yaml", "importPrintersAndFloorsYaml")
  .post("/git-update", "pullGitUpdates")
  .post("/restart", "restartServer")
  .get("/dump-fdm-monster-logs", "dumpLogZips")
  .post("/dump-fdm-monster-logs", "dumpLogZips")
  .delete("/clear-outdated-fdm-monster-logs", "clearLogs")
  .delete("/delete-all-printers", "deleteAllPrinters");
