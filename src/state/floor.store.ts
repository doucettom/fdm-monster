import { KeyDiffCache } from "@/utils/cache/key-diff.cache";
import { FloorService2 } from "@/services/orm/floor.service";
import { LoggerService } from "@/handlers/logger";
import { idType, IFloorService } from "@/services/orm/floor-service.interface";

/**
 * A generic cache for printer groups
 */
export class FloorStore extends KeyDiffCache {
  floorService: IFloorService;
  #logger: LoggerService;

  constructor({ floorService, loggerFactory }: { floorService: FloorService2; loggerFactory: (name: string) => LoggerService }) {
    super();
    this.floorService = floorService;
    this.#logger = loggerFactory(FloorStore.name);
  }

  async loadStore() {
    const floors = await this.floorService.list();

    if (!floors?.length) {
      this.#logger.log("Creating default floor as non existed");
      const floor = await this.floorService.createDefaultFloor();
      await this.setKeyValue(floor.id, floor, true);
      return;
    }

    const keyValues = floors.map((floor) => ({
      key: floor.id.toString(),
      value: floor,
    }));
    await this.setKeyValuesBatch(keyValues, true);
  }

  async listCache() {
    const floors = await this.getAllValues();
    if (floors?.length) {
      return floors;
    }

    await this.loadStore();
    return await this.getAllValues();
  }

  async create(input) {
    const floor = await this.floorService.create(input);
    await this.setKeyValue(floor.id, floor, true);
    return floor;
  }

  async delete(floorId: idType) {
    const deleteResult = await this.floorService.delete(floorId);
    await this.deleteKeyValue(floorId);
    return deleteResult;
  }

  async getFloor(floorId: idType) {
    let floor = await this.getValue(floorId);
    if (!!floor) return floor;

    floor = await this.floorService.get(floorId);
    await this.setKeyValue(floorId, floor, true);
    return floor;
  }

  async update(floorId: idType, input) {
    const floor = await this.floorService.update(floorId, input);
    await this.setKeyValue(floorId, floor, true);
    return floor;
  }

  async updateName(floorId: idType, updateSpec) {
    const floor = await this.floorService.updateName(floorId, updateSpec);
    await this.setKeyValue(floorId, floor, true);
    return floor;
  }

  async updateFloorNumber(floorId: idType, updateSpec) {
    const floor = await this.floorService.updateLevel(floorId, updateSpec);
    await this.setKeyValue(floorId, floor, true);
    return floor;
  }

  async addOrUpdatePrinter(floorId: idType, printerInFloor) {
    const floor = await this.floorService.addOrUpdatePrinter(floorId, printerInFloor);
    await this.setKeyValue(floorId, floor, true);
    return floor;
  }

  async removePrinter(floorId: idType, printerInFloor) {
    const floor = await this.floorService.removePrinter(floorId, printerInFloor);
    await this.deleteKeyValue(floorId);
    return floor;
  }

  async removePrinterFromAnyFloor(printerId: idType) {
    await this.floorService.deletePrinterFromAnyFloor(printerId);

    // Bit harsh, but we need to reload the entire store
    await this.loadStore();
  }
}
