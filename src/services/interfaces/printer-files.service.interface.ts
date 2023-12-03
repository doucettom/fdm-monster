import { IdType } from "@/shared.constants";
import { PrinterFileDto } from "@/services/interfaces/printer-file.dto";
import { IPrinterFile } from "@/models/PrinterFile";

export interface IPrinterFilesService<KeyType = IdType, Entity = IPrinterFile | PrinterFileDto> {
  toDto(entity: Entity): PrinterFileDto;

  getPrinterFiles(printerId: KeyType): Promise<Entity[]>;

  updateFiles(printerId: KeyType, newFiles: PrinterFileDto[]): Promise<Entity[]>;

  appendOrReplaceFile(printerId: KeyType, addedFile: PrinterFileDto): Promise<Entity[]>;

  clearFiles(printerId: KeyType): Promise<void>;

  deletePrinterFiles(printerId: KeyType, filePath: string[], throwError: boolean): Promise<void>;
}
