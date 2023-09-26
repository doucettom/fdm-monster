import { LoggerService } from "@/handlers/logger";
import { PrinterDto } from "@/services/orm/floor.service.interface";
import { Printer } from "@/entities/printer.entity";
import { BaseService } from "@/services/orm/base.service";
import { TypeormService } from "@/services/typeorm/typeorm.service";
import { IPrinterService } from "@/services/orm/printer.service.interface";
import { SqliteIdType } from "@/shared.constants";
import { getDefaultPrinterEntry } from "@/constants/service.constants";
import { normalizeURLWithProtocol } from "@/utils/url.utils";
import { validateInput } from "@/handlers/validators";
import { createPrinterRules } from "@/services/validators/printer-service.validation";
import { printerEvents } from "@/constants/event.constants";
import EventEmitter2 from "eventemitter2";

export class PrinterService extends BaseService(Printer, PrinterDto) implements IPrinterService<SqliteIdType> {
  logger: LoggerService;
  eventEmitter2: EventEmitter2;

  constructor({
    loggerFactory,
    typeormService,
    eventEmitter2,
  }: {
    loggerFactory: (name: string) => LoggerService;
    typeormService: TypeormService;
    eventEmitter2: EventEmitter2;
  }) {
    super({ typeormService });
    this.logger = loggerFactory(PrinterService.name);
    this.eventEmitter2 = eventEmitter2;
  }

  toDto(entity: Printer): PrinterDto {
    return {
      id: entity.id,
      name: entity.name,
      // url: entity.url,
      disabledReason: entity.disabledReason,
      dateAdded: entity.dateAdded,
    };
  }

  async list(): Promise<Printer[]> {
    return this.repository.find({
      order: {
        dateAdded: "ASC",
      },
    });
  }

  async create(newPrinter: Partial<Printer>, emitEvent = true): Promise<Printer> {
    const mergedPrinter = await this.validateAndDefault(newPrinter);
    mergedPrinter.dateAdded = Date.now();
    const printer = await this.create(mergedPrinter);
    if (emitEvent) {
      this.eventEmitter2.emit(printerEvents.printerCreated, { printer });
    }
    return printer;
  }

  batchImport(printers: Partial<Printer>[]): Promise<Printer[]> {
    return Promise.resolve([]);
  }

  deleteMany(printerIds: SqliteIdType[]): Promise<Printer[]> {
    return Promise.resolve([]);
  }

  updateConnectionSettings(printerId: SqliteIdType, partial: { printerURL: string; apiKey: string }): Promise<Printer> {
    return Promise.resolve(undefined);
  }

  updateDisabledReason(printerId: SqliteIdType, disabledReason: string): Promise<Printer> {
    return Promise.resolve(undefined);
  }

  updateEnabled(printerId: SqliteIdType, enabled: boolean): Promise<Printer> {
    return Promise.resolve(undefined);
  }

  updateFeedRate(printerId: SqliteIdType, feedRate: number): Promise<Printer> {
    return Promise.resolve(undefined);
  }

  updateFlowRate(printerId: SqliteIdType, flowRate: number): Promise<Printer> {
    return Promise.resolve(undefined);
  }

  private async validateAndDefault(printer: Partial<Printer>): Promise<Printer> {
    const mergedPrinter = {
      ...getDefaultPrinterEntry(),
      enabled: true,
      ...printer,
    };
    if (mergedPrinter.printerUrl?.length) {
      mergedPrinter.printerUrl = normalizeURLWithProtocol(mergedPrinter.printerUrl);
    }
    return await validateInput(mergedPrinter, createPrinterRules);
  }
}
