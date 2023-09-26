import { FloorPosition } from "@/entities/floor-position.entity";
import { BaseService } from "@/services/orm/base.service";
import { SqliteIdType } from "@/shared.constants";
import { TypeormService } from "@/services/typeorm/typeorm.service";
import { PositionDto } from "@/services/orm/floor.service.interface";

export class FloorPositionService extends BaseService(FloorPosition, PositionDto) {
  constructor({ typeormService }: { typeormService: TypeormService }) {
    super({ typeormService });
  }

  findPrinterPosition(printerId: SqliteIdType) {
    return this.repository.findOneBy({ id: printerId });
  }

  findPrinterPositionOnFloor(floorId: SqliteIdType, printerId: SqliteIdType) {
    return this.repository.findOneBy({ floorId, printerId });
  }

  toDto(entity: FloorPosition): PositionDto {
    return {
      x: entity.x,
      y: entity.y,
      printerId: entity.printerId,
      floorId: entity.floorId,
    };
  }
}
