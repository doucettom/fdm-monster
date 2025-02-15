import { KeyDiffCache, keyType } from "@/utils/cache/key-diff.cache";
import { printerEvents } from "@/constants/event.constants";
import { NotFoundException } from "@/exceptions/runtime.exceptions";
import { mapMongoDb } from "@/utils/mapper.utils";
import { PrinterService } from "@/services/printer.service";
import EventEmitter2 from "eventemitter2";
import { IdType } from "@/shared.constants";
import { IPrinterService } from "@/services/interfaces/printer.service.interface";
import { PrinterDto } from "@/services/interfaces/printer.dto";
import { Printer } from "@/entities";
import { IPrinter } from "@/models/Printer";

interface CachedPrinter {
  id: string;
  apiKey: string;
  printerURL: string;
  enabled: boolean;
  disabledReason: string;
  name: string;
  dateAdded: number;
  fileList: {
    files: Array<any>;
    folders: Array<any>;
    free: number;
    total: number;
  };
  feedRate: number;
  flowRate: number;
}

export class PrinterCache extends KeyDiffCache<CachedPrinter> {
  printerService: IPrinterService;
  eventEmitter2: EventEmitter2;

  constructor({ printerService, eventEmitter2 }: { printerService: IPrinterService; eventEmitter2: EventEmitter2 }) {
    super();
    this.printerService = printerService;
    this.eventEmitter2 = eventEmitter2;

    this.eventEmitter2.on(printerEvents.batchPrinterCreated, this.handleBatchPrinterCreated.bind(this));
    this.eventEmitter2.on(printerEvents.printerCreated, this.handlePrinterCreatedOrUpdated.bind(this));
    this.eventEmitter2.on(printerEvents.printerUpdated, this.handlePrinterCreatedOrUpdated.bind(this));
    this.eventEmitter2.on(printerEvents.printersDeleted, this.handlePrintersDeleted.bind(this));
  }

  async loadCache(): Promise<CachedPrinter> {
    // TODO this is missing any login required for middleware
    const printerDocs = await this.printerService.list();
    const dtos = this.mapArray(printerDocs);
    const keyValues = dtos.map((p) => ({ key: this.getId(p), value: p }));
    await this.setKeyValuesBatch(keyValues, true);
    return dtos;
  }

  async listCachedPrinters(includeDisabled = false): Promise<CachedPrinter[]> {
    const printers = await this.getAllValues();
    if (!includeDisabled) {
      return printers.filter((p) => p.enabled);
    }
    return printers;
  }

  async getCachedPrinterOrThrowAsync(id: keyType): Promise<CachedPrinter | null> {
    const printer = await this.getValue(id);
    if (!printer) {
      throw new NotFoundException(`Printer with id ${id} not found`);
    }
    return printer;
  }

  getCachedPrinterOrThrow(id: keyType) {
    const printer = this.keyValueStore[id];
    if (!printer) {
      throw new NotFoundException(`Printer with id ${id} not found`);
    }
    return printer;
  }

  async getNameAsync(id: keyType) {
    const printer = await this.getCachedPrinterOrThrowAsync(id);
    return printer.name;
  }

  getName(id: keyType) {
    const printer = this.getCachedPrinterOrThrow(id);
    return printer.name;
  }

  async getLoginDtoAsync(id: keyType) {
    const printer = await this.getCachedPrinterOrThrowAsync(id);
    return {
      printerURL: printer.printerURL,
      apiKey: printer.apiKey,
    };
  }

  getLoginDto(id: keyType) {
    const printer = this.getCachedPrinterOrThrow(id);
    return {
      printerURL: printer.printerURL,
      apiKey: printer.apiKey,
    };
  }

  async handleBatchPrinterCreated({ printers }) {
    const mappedPrinters = this.mapArray(printers);
    const keyValues = mappedPrinters.map((p) => ({ key: this.getId(p), value: p }));
    await this.setKeyValuesBatch(keyValues, true);
  }

  async handlePrinterCreatedOrUpdated({ printer }) {
    const printerDto = this.map(printer);
    await this.setKeyValue(printerDto.id, printerDto, true);
  }

  async handlePrintersDeleted({ printerIds }: { printerIds: keyType[] }) {
    await this.deleteKeysBatch(printerIds, true);
  }

  private getId(value: IPrinter | Printer) {
    return value.id.toString();
  }

  private mapArray(entities: (IPrinter | Printer)[]) {
    return entities.map((p) => {
      return this.map(p);
    });
  }

  private map(entity: IPrinter | Printer): PrinterDto<IdType> {
    return this.printerService.toUnsafeDto(entity);
  }
}
