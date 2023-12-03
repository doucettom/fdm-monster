import { PrinterMockData } from "./test-data/printer.data";
import { Floor } from "@/entities/floor.entity";
import { DITokens } from "@/container.tokens";
import { FloorService } from "@/services/floor.service";
import { IFloorService } from "@/services/interfaces/floor.service.interface";
import { IPrinterService } from "@/services/interfaces/printer.service.interface";
import { SqliteIdType } from "@/shared.constants";
import { Printer } from "@/entities";
import { setupTestApp } from "../test-server";
import { FloorPositionService } from "@/services/orm/floor-position.service";

let printerService: IPrinterService<SqliteIdType, Printer>;
let floorService: IFloorService<SqliteIdType, Floor>;
let floorPositionService: FloorPositionService;

beforeAll(async () => {
  const { container, httpClient: axiosMock } = await setupTestApp(true);
  printerService = container.resolve<IPrinterService<SqliteIdType, Printer>>(DITokens.printerService);
  floorService = container.resolve<IFloorService<SqliteIdType, Floor>>(DITokens.floorService);
  floorPositionService = container.resolve<FloorPositionService>(DITokens.floorPositionService);
});

describe(FloorService.name, () => {
  it("can be created correctly without printers", async () => {
    // Create it
    const result = await floorService.create({
      name: "TopFloor1",
      floor: 1,
      printers: [],
    });

    // Assert creation
    const floor = await floorService.get(result.id);
    expect(floor).toBeTruthy();
  });

  it("dto mapping floor", async () => {
    const floor = await floorService.create({
      name: "TopFloor1",
      floor: 11,
      printers: [],
    });
    const dto = floorService.toDto(floor);
    expect(dto).toBeTruthy();
    expect(typeof dto.id).toBe("number");
  });

  it("can delete existing floor", async () => {
    // Create it
    const floor = await floorService.create({
      name: "TopFloor1",
      floor: 2,
      printers: [],
    });

    expect(floorService.get(floor.id)).toBeTruthy();
    await floorService.delete(floor.id);
    await expect(floorService.get(floor.id)).rejects.toBeTruthy();
  });

  it("can not add printer to floor", async () => {
    // Prepare the CRUD DTO
    const newPrinter = PrinterMockData.PrinterMock;
    const pos = await printerService.create(newPrinter);

    // Create it
    const floor = await floorService.create({
      name: "TopFloor1",
      floor: 3,
      printers: [],
    });

    expect(floorService.get(floor.id)).toBeTruthy();
    const newFloor = await floorService.addOrUpdatePrinter(floor.id, {
      floorId: floor.id,
      printerId: pos.id,
      x: 1,
      y: 1,
    });
    expect(newFloor.printers).toHaveLength(1);
  });

  it("can delete printer from floor", async () => {
    // Prepare the CRUD DTO
    const newPrinter = PrinterMockData.PrinterMock;
    const printer = await printerService.create(newPrinter);

    // Create it
    let floor = await floorService.create({
      name: "TopFloor1",
      floor: 4,
    });
    await floorPositionService.create({ floorId: floor.id, printerId: printer.id, x: 1, y: 1 });
    floor = await floorService.get(floor.id);
    // Check existence
    expect(floorService.get(floor.id)).toBeTruthy();
    expect(floor.printers).toHaveLength(1);

    // TODO when printerId is undefined error should be thrown
    const newFloor = await floorService.removePrinter(floor.id, printer.id);
    expect(newFloor.printers).toHaveLength(0);
  });
});
