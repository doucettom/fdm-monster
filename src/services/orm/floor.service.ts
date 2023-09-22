import { BaseService } from "@/services/orm/base.service";
import { Floor } from "@/entities";
import { EntityDTO, Loaded } from "@mikro-orm/core";
import { FloorDto, IFloorService, PositionDto } from "@/services/orm/floor-service.interface";
import { sqliteIdType } from "@/shared.constants";
import { EntityManager } from "@mikro-orm/better-sqlite";
import { FloorPositionService } from "./floor-position.service";
import { FloorPosition } from "@/entities/FloorPosition";

export class FloorService2 extends BaseService(Floor) implements IFloorService {
  private floorPositionService: FloorPositionService;

  constructor({ em, floorPositionService }: { em: EntityManager; floorPositionService: FloorPositionService }) {
    super({ em });
    this.floorPositionService = floorPositionService;
  }

  toDto(floor: Loaded<Floor>): EntityDTO<Loaded<Floor, never>> {
    return {
      id: floor.id,
      name: floor.name,
      floor: floor.floor,
      positions: floor.positions.map((p) => ({
        id: p.id,
        x: p.x,
        y: p.y,
        printerId: p.printerId,
        floorId: p.floorId,
      })),
    };
  }

  async createDefaultFloor() {
    const floor = await this.create(new Floor("Default Floor", 1));
    return this.toDto(floor);
  }

  async updateName(floorId: sqliteIdType, name: string) {
    let floor = await this.get(floorId);
    floor.name = name;
    floor = await this.update(floorId, { name });
    return this.toDto(floor);
  }

  async updateFloorNumber(floorId: sqliteIdType, floor: number): Promise<FloorDto> {
    let floorEntity = await this.get(floorId);
    floorEntity.floor = floor;
    floorEntity = await this.update(floorId, { floor });
    return this.toDto(floorEntity);
  }

  async addOrUpdatePrinter(floorId: sqliteIdType, positionDto: PositionDto): Promise<FloorDto> {
    const floor = await this.get(floorId);

    const position = await this.floorPositionService.findPrinterPosition(positionDto.printerId as sqliteIdType);
    if (position) {
      await this.floorPositionService.delete(position.id);
    }

    floor.positions.add(new FloorPosition(positionDto.x, positionDto.y, positionDto.printerId as sqliteIdType, floorId));

    await this.em.flush();
    return this.toDto(floor);
  }

  async removePrinter(floorId: sqliteIdType, printerId: sqliteIdType): Promise<FloorDto> {
    const position = await this.floorPositionService.findPrinterPositionOnFloor(floorId, printerId as sqliteIdType);
    await this.floorPositionService.delete(position!.id);
    const floor = await this.get(floorId);
    return this.toDto(floor);
  }
}
