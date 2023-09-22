import { FloorPosition } from "@/entities/FloorPosition";
import { BaseService } from "@/services/orm/base.service";
import { EntityManager } from "@mikro-orm/better-sqlite";
import { sqliteIdType } from "@/shared.constants";
import { EntityDTO, Loaded } from "@mikro-orm/core";

export class FloorPositionService extends BaseService(FloorPosition) {
  constructor({ em }: { em: EntityManager }) {
    super({ em });
  }

  findPrinterPosition(printerId: sqliteIdType) {
    return this.repository.findOne({ printerId });
  }

  findPrinterPositionOnFloor(floorId: sqliteIdType, printerId: sqliteIdType) {
    return this.repository.findOne({ floorId, printerId });
  }

  toDto(entity: Loaded<FloorPosition>): EntityDTO<Loaded<FloorPosition, never>> {
    return {
      id: entity.id,
      x: entity.x,
      y: entity.y,
      printerId: entity.printerId,
      floorId: entity.floorId,
    };
  }
}
