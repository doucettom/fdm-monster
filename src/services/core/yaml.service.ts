import { validateInput } from "@/handlers/validators";
import {
  exportPrintersFloorsYamlRules,
  importPrinterPositionsRules,
  importPrintersFloorsYamlRules,
} from "../validators/yaml-service.validation";
import { dump, load } from "js-yaml";
import { LoggerService } from "@/handlers/logger";
import { PrinterCache } from "@/state/printer.cache";
import { FloorStore } from "@/state/floor.store";
import { ILoggerFactory } from "@/handlers/logger-factory";
import { IPrinterService } from "@/services/interfaces/printer.service.interface";
import { IFloorService } from "@/services/interfaces/floor.service.interface";
import { MongoIdType } from "@/shared.constants";
import { FloorPositionService } from "@/services/orm/floor-position.service";

export class YamlService {
  floorStore: FloorStore;
  floorService: IFloorService<MongoIdType>;
  printerService: IPrinterService<MongoIdType>;
  printerCache: PrinterCache;
  serverVersion: string;
  private logger: LoggerService;
  private readonly isTypeormMode: boolean;

  constructor({
    printerService,
    printerCache,
    floorStore,
    floorService,
    loggerFactory,
    serverVersion,
    isTypeormMode,
  }: {
    printerService: IPrinterService<MongoIdType>;
    printerCache: PrinterCache;
    floorStore: FloorStore;
    floorService: IFloorService<MongoIdType>;
    loggerFactory: ILoggerFactory;
    serverVersion: string;
    isTypeormMode: boolean;
  }) {
    this.floorStore = floorStore;
    this.printerService = printerService;
    this.printerCache = printerCache;
    this.floorService = floorService;
    this.serverVersion = serverVersion;
    this.logger = loggerFactory(YamlService.name);
    this.isTypeormMode = isTypeormMode;
  }

  async importPrintersAndFloors(yamlBuffer: string) {
    const importSpec = await load(yamlBuffer);
    const { exportPrinters, exportFloorGrid, exportFloors } = importSpec?.config;

    for (const printer of importSpec.printers) {
      // old export bug
      if (!printer.name && printer.printerName) {
        printer.name = printer.printerName;
        delete printer.printerName;
      }
      // 1.5.2 schema
      if (printer.settingsAppearance?.name) {
        printer.name = printer.settingsAppearance?.name;
        delete printer.settingsAppearance?.name;
      }

      if (this.isTypeormMode && typeof printer.id === "string") {
        delete printer.id;
      } else if (!this.isTypeormMode && typeof printer.id === "number") {
        delete printer.id;
      }
    }

    for (const floor of importSpec.floors) {
      if (this.isTypeormMode && typeof floor.id === "string") {
        delete floor.id;
      } else if (!this.isTypeormMode && typeof floor.id === "number") {
        delete floor.id;
      }
    }

    const importData = await validateInput(
      importSpec,
      importPrintersFloorsYamlRules(exportPrinters, exportFloorGrid, exportFloors, this.isTypeormMode)
    );

    // Nested validation is manual (for now)
    if (!!exportFloorGrid) {
      for (let floor of importData.floors) {
        await validateInput(floor, importPrinterPositionsRules);
      }
    }

    this.logger.log("Analysing printers for import");
    const { updateByPropertyPrinters, insertPrinters } = await this.analysePrintersUpsert(
      importData.printers,
      importData.config.printerComparisonStrategiesByPriority
    );

    this.logger.log("Analysing floors for import");
    const { updateByPropertyFloors, insertFloors } = await this.analyseFloorsUpsert(
      importData.floors,
      importData.config.floorComparisonStrategiesByPriority
    );

    this.logger.log(`Performing pure insert printers (${insertPrinters.length} printers)`);
    const printerIdMap = {};
    for (const newPrinter of insertPrinters) {
      const state = await this.printerService.create(newPrinter);
      printerIdMap[newPrinter.id] = state.id;
    }
    this.logger.log(`Performing update import printers (${updateByPropertyPrinters.length} printers)`);
    for (const updatePrinterSpec of updateByPropertyPrinters) {
      const updateId = updatePrinterSpec.printerId;
      const state = await this.printerService.update(updateId, updatePrinterSpec.value);
      printerIdMap[updatePrinterSpec.printerId] = state.id;
    }

    this.logger.log(`Performing pure create floors (${insertFloors.length} floors)`);
    const floorIdMap = {};
    for (const newFloor of insertFloors) {
      // Replace printerIds with newly mapped IDs
      const knownPrinters = [];
      if (exportFloorGrid && exportPrinters) {
        for (const floorPosition of newFloor.printers) {
          const knownPrinterId = printerIdMap[floorPosition.printerId];
          // If the ID was not mapped, this position is considered discarded
          if (!knownPrinterId) continue;

          floorPosition.printerId = knownPrinterId;
          knownPrinters.push(floorPosition);
        }
        newFloor.printers = knownPrinters;
      }

      const state = await this.floorStore.create(newFloor, false);
      floorIdMap[newFloor.id] = state.id;
    }

    this.logger.log(`Performing update of floors (${updateByPropertyFloors.length} floors)`);
    for (const updateFloorSpec of updateByPropertyFloors) {
      const updateId = updateFloorSpec.floorId;
      const updatedFloor = updateFloorSpec.value;

      const knownPrinters = [];
      if (exportFloorGrid && exportPrinters) {
        for (const floorPosition of updatedFloor?.printers) {
          // TODO check this works from MongoDB to SQLite
          const knownPrinterId = printerIdMap[floorPosition.printerId];
          // If the ID was not mapped, this position is considered discarded
          if (!knownPrinterId) continue;

          floorPosition.printerId = knownPrinterId;
          knownPrinters.push(floorPosition);
        }
        updatedFloor.printers = knownPrinters;
      }

      const state = await this.floorStore.update(updateId, updatedFloor);
      floorIdMap[updateId] = state.id;
    }

    await this.floorStore.loadStore();

    return {
      updateByPropertyPrinters,
      updateByPropertyFloors,
      insertPrinters,
      insertFloors,
      printerIdMap,
      floorIdMap,
    };
  }

  async analysePrintersUpsert(upsertPrinters, comparisonStrategies) {
    const existingPrinters = await this.printerService.list();

    const names = existingPrinters.map((p) => p.name.toLowerCase());
    const urls = existingPrinters.map((p) => p.printerURL);
    const ids = existingPrinters.map((p) => p.id.toString());

    const insertPrinters = [];
    const updateByPropertyPrinters = [];
    for (const printer of upsertPrinters) {
      for (const strategy of [...comparisonStrategies, "new"]) {
        if (strategy === "name") {
          const comparedName = printer.name.toLowerCase();
          const foundIndex = names.findIndex((n) => n === comparedName);
          if (foundIndex !== -1) {
            updateByPropertyPrinters.push({
              strategy: "name",
              printerId: ids[foundIndex],
              value: printer,
            });
            break;
          }
        } else if (strategy === "url") {
          const comparedName = printer.printerURL.toLowerCase();
          const foundIndex = urls.findIndex((n) => n === comparedName);
          if (foundIndex !== -1) {
            updateByPropertyPrinters.push({
              strategy: "url",
              printerId: ids[foundIndex],
              value: printer,
            });
            break;
          }
        } else if (strategy === "id") {
          const comparedName = printer.id.toLowerCase();
          const foundIndex = ids.findIndex((n) => n === comparedName);
          if (foundIndex !== -1) {
            updateByPropertyPrinters.push({
              strategy: "id",
              printerId: ids[foundIndex],
              value: printer,
            });
            break;
          }
        } else if (strategy === "new") {
          insertPrinters.push(printer);
          break;
        }
      }
    }

    return {
      updateByPropertyPrinters,
      insertPrinters,
    };
  }

  async analyseFloorsUpsert(upsertFloors, comparisonStrategy) {
    const existingFloors = await this.floorService.list();
    const names = existingFloors.map((p) => p.name.toLowerCase());
    const floorLevels = existingFloors.map((p) => p.floor);
    const ids = existingFloors.map((p) => p.id.toString());

    const insertFloors = [];
    const updateByPropertyFloors = [];
    for (const floor of upsertFloors) {
      for (const strategy of [comparisonStrategy, "new"]) {
        if (strategy === "name") {
          const comparedProperty = floor.name.toLowerCase();
          const foundIndex = names.findIndex((n) => n === comparedProperty);
          if (foundIndex !== -1) {
            updateByPropertyFloors.push({
              strategy: "name",
              floorId: ids[foundIndex],
              value: floor,
            });
            break;
          }
        } else if (strategy === "floor") {
          const comparedProperty = floor.floor;
          const foundIndex = floorLevels.findIndex((n) => n === comparedProperty);
          if (foundIndex !== -1) {
            updateByPropertyFloors.push({
              strategy: "floor",
              floorId: ids[foundIndex],
              value: floor,
            });
            break;
          }
        } else if (strategy === "id") {
          const comparedProperty = floor.id.toLowerCase();
          const foundIndex = ids.findIndex((n) => n === comparedProperty);
          if (foundIndex !== -1) {
            updateByPropertyFloors.push({
              strategy: "id",
              floorId: ids[foundIndex],
              value: floor,
            });
            break;
          }
        } else if (strategy === "new") {
          insertFloors.push(floor);
          break;
        }
      }
    }

    return {
      updateByPropertyFloors,
      insertFloors,
    };
  }

  async exportPrintersAndFloors(options) {
    const input = await validateInput(options, exportPrintersFloorsYamlRules);
    const {
      exportFloors,
      exportPrinters,
      exportFloorGrid,
      // dropPrinterIds, // optional idea for future
      // dropFloorIds, // optional idea for future
      // printerComparisonStrategiesByPriority, // not used for export
      // floorComparisonStrategiesByPriority, // not used for export
      // notes, // passed on to config immediately
    } = input;

    const dumpedObject = {
      version: process.env.npm_package_version,
      exportedAt: new Date(),
      databaseType: this.isTypeormMode ? "sqlite" : "mongo",
      config: input,
    };

    if (exportPrinters) {
      const printers = await this.printerService.list();
      dumpedObject.printers = printers.map((p) => {
        const printerId = p.id;
        const { apiKey } = this.printerCache.getLoginDto(printerId);
        return {
          id: printerId,
          stepSize: p.stepSize,
          disabledReason: p.disabledReason,
          enabled: p.enabled,
          dateAdded: p.dateAdded,
          name: p.name,
          printerURL: p.printerURL,
          apiKey,
        };
      });
    }

    if (exportFloors) {
      const floors = await this.floorStore.listCache();
      dumpedObject.floors = floors.map((f) => {
        const dumpedFloor = {
          id: f.id,
          floor: f.floor,
          name: f.name,
        };

        if (exportFloorGrid) {
          dumpedFloor.printers = f.printers.map((p) => {
            const fPrinterId = p.printerId.toString();
            return {
              printerId: fPrinterId,
              x: p.x,
              y: p.y,
            };
          });
        }

        return dumpedFloor;
      });
    }

    return dump(dumpedObject, {});
  }
}
