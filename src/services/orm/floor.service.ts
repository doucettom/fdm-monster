import { BaseService } from "@/services/orm/base.service";
import { Floor } from "@/entities";
import { FloorDto, IFloorService, PositionDto } from "@/services/orm/floor.service.interface";
import { SqliteIdType } from "@/shared.constants";
import { FloorPositionService } from "./floor-position.service";
import { FloorPosition } from "@/entities/floor-position.entity";
import { TypeormService } from "@/services/typeorm/typeorm.service";

export class FloorService2 extends BaseService(Floor, FloorDto) implements IFloorService<SqliteIdType> {
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

  async updateName(floorId: SqliteIdType, name: string) {
    let floor = await this.get(floorId);
    floor.name = name;
    floor = await this.update(floorId, { name });
    return floor;
  }

  async updateLevel(floorId: SqliteIdType, level: number): Promise<Floor> {
    let floor = await this.get(floorId);
    floor.level = level;
    floor = await this.update(floorId, { level });
    return floor;
  }

  async addOrUpdatePrinter(floorId: SqliteIdType, positionDto: PositionDto): Promise<Floor> {
    const floor = await this.get(floorId);

    const position = await this.floorPositionService.findPrinterPosition(positionDto.printerId as SqliteIdType);
    if (position) {
      await this.floorPositionService.delete(position.id);
    }

    const newPosition = new FloorPosition();
    Object.assign(newPosition, {
      x: positionDto.x,
      y: positionDto.y,
      printerId: positionDto.printerId as SqliteIdType,
      floorId,
    });

    floor.positions.push(newPosition);
    await this.update(floorId, floor);
    return floor;
  }

  async removePrinter(floorId: SqliteIdType, printerId: SqliteIdType): Promise<Floor> {
    const position = await this.floorPositionService.findPrinterPositionOnFloor(floorId, printerId as SqliteIdType);
    await this.floorPositionService.delete(position!.id);
    return await this.get(floorId);
  }
}
