import { BaseService } from "@/services/orm/base.service";
import { Floor } from "@/entities";
import { FloorDto, IFloorService, PositionDto } from "@/services/orm/floor-service.interface";
import { sqliteIdType } from "@/shared.constants";
import { FloorPositionService } from "./floor-position.service";
import { FloorPosition } from "@/entities/floor-position.entity";
import { TypeormService } from "@/services/typeorm/typeorm.service";

export class FloorService2 extends BaseService(Floor) implements IFloorService {
  private floorPositionService: FloorPositionService;

  constructor({
    floorPositionService,
    typeormService,
  }: {
    typeormService: TypeormService;
    floorPositionService: FloorPositionService;
  }) {
    super({ typeormService });
    this.floorPositionService = floorPositionService;
  }

  toDto(floor: Floor): FloorDto {
    return {
      id: floor.id,
      name: floor.name,
      level: floor.level,
      positions: floor.positions.map((p) => ({
        printerId: p.printerId,
        floorId: p.floorId,
        x: p.x,
        y: p.y,
      })),
    };
  }

  async createDefaultFloor() {
    const floor = await this.create({
      name: "Default Floor",
      level: 0,
    });
    return this.toDto(floor);
  }

  async updateName(floorId: sqliteIdType, name: string) {
    let floor = await this.get(floorId);
    floor.name = name;
    floor = await this.update(floorId, { name });
    return this.toDto(floor);
  }

  async updateLevel(floorId: sqliteIdType, level: number): Promise<FloorDto> {
    let floorEntity = await this.get(floorId);
    floorEntity.level = level;
    floorEntity = await this.update(floorId, { level });
    return this.toDto(floorEntity);
  }

  async addOrUpdatePrinter(floorId: sqliteIdType, positionDto: PositionDto): Promise<FloorDto> {
    const floor = await this.get(floorId);

    const position = await this.floorPositionService.findPrinterPosition(positionDto.printerId as sqliteIdType);
    if (position) {
      await this.floorPositionService.delete(position.id);
    }

    const newPosition = new FloorPosition();
    Object.assign(newPosition, {
      x: positionDto.x,
      y: positionDto.y,
      printerId: positionDto.printerId as sqliteIdType,
      floorId,
    });

    floor.positions.push(newPosition);

    return this.toDto(floor);
  }

  async removePrinter(floorId: sqliteIdType, printerId: sqliteIdType): Promise<FloorDto> {
    const position = await this.floorPositionService.findPrinterPositionOnFloor(floorId, printerId as sqliteIdType);
    await this.floorPositionService.delete(position!.id);
    const floor = await this.get(floorId);
    return this.toDto(floor);
  }
}
