import { Floor } from "@/entities/mikro";
import { Floor as MongoFloor } from "@/models/Floor";
import { sqliteIdType, mongoIdType } from "@/shared.constants";
import { FindOptions, Loaded } from "@mikro-orm/core";

export type idType = sqliteIdType | mongoIdType;
export interface IFloorService {
  toDto(floor: Loaded<Floor> | typeof MongoFloor): FloorDto;

  list<P extends string = never>(options?: FindOptions<Floor, P>): Promise<Loaded<Floor, P>[]>;

  create<P extends string = never>(input: Floor): Promise<Loaded<Floor, P>>;

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
  // apiKey: string;
  // printerURL: string;
}

export interface PositionDto {
  x: number;
  y: number;
  printerId: idType;
  floorId: idType;
}

// MongoDB version
export interface PrinterInFloorDto extends IdDto {
  x: number;
  y: number;
  printerId: idType;
}

export interface FloorDto extends IdDto {
  name: string;
  floor: number;
  printers: PrinterDto[];
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
