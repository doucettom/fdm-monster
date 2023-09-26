import { Floor } from "@/entities";
import { Floor as MongoFloor } from "@/models/Floor";
import { mongoIdType, sqliteIdType } from "@/shared.constants";
import { FindManyOptions } from "typeorm";

export type idType = sqliteIdType | mongoIdType;

export interface IFloorService {
  toDto(floor: Floor | typeof MongoFloor): FloorDto;

  list(options?: FindManyOptions<Floor>): Promise<Floor[]>;

  create(input: Floor): Promise<Floor>;

  delete(floorId: idType): Promise<boolean>;

  get(floorId: idType): Promise<Floor>;

  update(floorId: idType, input: Floor): Promise<Floor>;

  updateName(floorId: idType, name: string): Promise<Floor>;

  updateLevel(floorId: idType, level: number): Promise<Floor>;

  addOrUpdatePrinter(floorId: idType, position: PositionDto): Promise<Floor>;

  removePrinter(floorId: idType, printerId: idType): Promise<Floor>;
}

export class IdDto {
  id: idType;
}

export class PrinterDto extends IdDto {
  name: string;
  // apiKey: string;
  // printerURL: string;
}

export class PositionDto {
  x: number;
  y: number;
  printerId: idType;
  floorId: idType;
}

// MongoDB version
export class PrinterInFloorDto extends IdDto {
  x: number;
  y: number;
  printerId: idType;
}

export class FloorDto extends IdDto {
  name: string;
  level: number;
  positions: PositionDto[];
}

export class CreateFloorDto {
  name: string;
  floor: number;
}

export class UpdateFloorDto {
  name?: string;
  floor?: number;
}

export class AddOrUpdatePrinterDto {
  printerId: idType;
}
