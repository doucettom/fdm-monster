import { Floor } from "@/entities";
import { sqliteIdType, mongoIdType } from "@/shared.constants";

export type idType = sqliteIdType | mongoIdType;
export interface IFloorService {
  list(): Promise<FloorDto[]>;

  create(input: Floor): Promise<FloorDto>;

  delete(floorId: idType): Promise<boolean>;

  get(floorId: idType): Promise<FloorDto>;

  update(floorId: idType, input: Floor): Promise<FloorDto>;

  updateName(floorId: idType, name: string): Promise<FloorDto>;

  updateFloorNumber(floorId: idType, floor: number): Promise<FloorDto>;

  addOrUpdatePrinter(floorId: idType, position: PositionDto): Promise<FloorDto>;

  removePrinter(floorId: idType, printerId: idType): Promise<FloorDto>;
}

export interface IdDto {
  id: idType;
}

export interface PrinterDto extends IdDto {
  name: string;
  apiKey: string;
  printerURL: string;
}

export interface PositionDto extends IdDto {
  x: number;
  y: number;
  printerId: idType;
  floorId: idType;
}

export interface FloorDto extends IdDto {
  floor: number;
  positions: PositionDto[];
}

export interface CreateFloorDto {
  name: string;
  floor: number;
}

export interface UpdateFloorDto {
  name?: string;
  floor?: number;
}

export interface AddOrUpdatePrinterDto {
  printerId: idType;
}
