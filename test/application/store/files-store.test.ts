import { DITokens } from "@/container.tokens";
import { PrinterCache } from "@/state/printer.cache";
import { PrinterFilesService } from "@/services/printer-files.service";
import { AwilixContainer } from "awilix";
import { PrinterFilesStore } from "@/state/printer-files.store";
import { PrinterService } from "@/services/printer.service";
import { setupTestApp } from "../../test-server";

let container: AwilixContainer;
let printerFilesStore: PrinterFilesStore;
let printerFilesService: PrinterFilesService;
let printerService: PrinterService;
let printerCache: PrinterCache;

beforeEach(async () => {
  const { container } = await setupTestApp(true);
  printerFilesStore = container.resolve(DITokens.printerFilesStore);
  printerFilesService = container.resolve(DITokens.printerFilesService);
  printerService = container.resolve(DITokens.printerService);
  printerCache = container.resolve(DITokens.printerCache);
});

describe(PrinterFilesStore.name, () => {
  const validNewPrinter = {
    apiKey: "asdasasdasdasdasdasdasdasdasdasd",
    printerURL: "https://asd.com:81",
    name: "TestPrinter",
  };

  it("old files - should deal with empty files cache correctly", async () => {
    await printerCache.loadCache();
    let testPrinterState = await printerService.create(validNewPrinter);
    await printerFilesStore.loadFilesStore();

    const filesCache = printerFilesStore.getFiles(testPrinterState.id);
    expect(filesCache.length).toBe(0);

    const oldFiles = printerFilesStore.getOutdatedFiles(testPrinterState.id, 7);
    expect(oldFiles.length).toBe(0);
  });

  it("old files - should keep new files correctly", async () => {
    await printerCache.loadCache();
    let testPrinterState = await printerService.create(validNewPrinter);
    await printerFilesService.updateFiles(testPrinterState.id, [
      {
        date: Date.now() / 1000,
        name: "file.gcode",
        path: "file.gcode",
        display: "file.gcode",
        hash: "123",
        origin: "123",
      },
    ]);
    await printerFilesStore.loadFilesStore();

    const filesCache = printerFilesStore.getFiles(testPrinterState.id);
    expect(filesCache.length).toBe(1);

    const oldFiles = printerFilesStore.getOutdatedFiles(testPrinterState.id, 7);
    expect(oldFiles.length).toBe(0);
    await printerFilesService.updateFiles(testPrinterState.id, []);
  });

  it("old files - should filter old files correctly", async () => {
    await printerCache.loadCache();
    let testPrinterState = await printerService.create(validNewPrinter);

    await printerFilesService.updateFiles(testPrinterState.id, [
      {
        date: Date.now() / 1000,
        name: "file.gcode",
        path: "file.gcode",
        display: "file.gcode",
        hash: "123",
        origin: "123",
      },
      {
        date: Date.now() / 1000 - 8 * 86400,
        name: "file2.gcode",
        path: "file2.gcode",
        display: "file2.gcode",
        hash: "124",
        origin: "124",
      },
    ]);
    await printerFilesStore.loadFilesStore();

    const filesCache = printerFilesStore.getFiles(testPrinterState.id);
    expect(filesCache.length).toBe(2);

    const oldFiles = printerFilesStore.getOutdatedFiles(testPrinterState.id, 7);
    expect(oldFiles.length).toBe(1);
  });
});
