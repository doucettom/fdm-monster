import { Floor } from "@/entities";
import { Floor as MongoFloor } from "@/models/Floor";
import { MongoIdType, SqliteIdType } from "@/shared.constants";
import { DeleteResult, FindManyOptions } from "typeorm";

export type idType = SqliteIdType | MongoIdType;

export interface IFloorService<KeyType> {
  toDto(floor: Floor | typeof MongoFloor): FloorDto;

  list(options?: FindManyOptions<Floor>): Promise<Floor[]>;

  create(input: Floor): Promise<Floor>;

  delete(floorId: KeyType): Promise<DeleteResult | boolean>;

  get(floorId: KeyType): Promise<Floor>;

  update(floorId: KeyType, input: Floor): Promise<Floor>;

  updateName(floorId: KeyType, name: string): Promise<Floor>;

  updateLevel(floorId: KeyType, level: number): Promise<Floor>;

  addOrUpdatePrinter(floorId: KeyType, position: PositionDto): Promise<Floor>;

  removePrinter(floorId: KeyType, printerId: KeyType): Promise<Floor>;
}

export class IdDto {
  id: idType;
}

export class PrinterDto extends IdDto {
  name: string;
  disabledReason: string;
  dateAdded: number;
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
