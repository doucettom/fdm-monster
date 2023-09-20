import { BaseService } from "@/services/orm/base.service";
import { Floor } from "@/entities";
import { Loaded } from "@mikro-orm/core";

export interface IdDto {
  id: number;
}

export interface PrinterDto extends IdDto {
  name: string;
  apiKey: string;
  printerURL: string;
}

export interface FloorDto extends IdDto {
  id: number;
  floor: number;
  printers: PrinterDto[];
}

export class FloorService2 extends BaseService(Floor) {
  toDto(floor: Loaded<Floor>): FloorDto {
    return {
      id: floor.id,
      floor: floor.floor,
      printers: floor.printers.map((p) => ({
        id: p.id,
        name: p.name,
        apiKey: p.apiKey,
        printerURL: p.printerURL,
      })),
    };
  }

  async createDefaultFloor() {
    const floor = await this.create(new Floor("Default Floor", 1));
    return this.toDto(floor);
  }
}
