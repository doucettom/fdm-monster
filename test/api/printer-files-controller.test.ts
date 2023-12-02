import { setupTestApp } from "../test-server";
import { createTestPrinter } from "./test-data/create-printer";
import { expectInvalidResponse, expectNotFoundResponse, expectOkResponse } from "../extensions";
import { AppConstants } from "@/server.constants";
import nock from "nock";
import supertest from "supertest";
import { OctoPrintApiMock } from "../mocks/octoprint-api.mock";
import { PrinterFilesController } from "@/controllers/printer-files.controller";
import { AwilixContainer } from "awilix";
import { DITokens } from "@/container.tokens";
import { IPrinterService } from "@/services/interfaces/printer.service.interface";

const defaultRoute = AppConstants.apiRoute + "/printer-files";
const trackedUploadsRoute = `${defaultRoute}/tracked-uploads`;
const purgeIndexedFilesRoute = `${defaultRoute}/purge`;
const batchReprintRoute = `${defaultRoute}/batch/reprint-files`;
type idType = Number;
const getRoute = (id: idType) => `${defaultRoute}/${id}`;
const clearFilesRoute = (id: idType) => `${getRoute(id)}/clear`;
const moveFileOrFolderRoute = (id: idType) => `${getRoute(id)}/move`;
const deleteFileOrFolderRoute = (id: idType, path: string) => `${getRoute(id)}?path=${path}`;
const selectAndPrintRoute = (id: idType) => `${getRoute(id)}/select`;
const uploadFileRoute = (id: idType) => `${getRoute(id)}/upload`;
const createFolderRoute = (id: idType) => `${getRoute(id)}/create-folder`;
const getFilesRoute = (id: idType, recursive: boolean) => `${getRoute(id)}?recursive=${recursive}`;
const getCacheRoute = (id: idType) => `${getRoute(id)}/cache`;

let request: supertest.SuperTest<supertest.Test>;
let octoPrintApiService: OctoPrintApiMock;
let container: AwilixContainer;
let printerService: IPrinterService;

beforeAll(async () => {
  ({ request, octoPrintApiService, container } = await setupTestApp(true));
  printerService = container.resolve<IPrinterService>(DITokens.printerService);
});

beforeEach(async () => {
  const printers = await printerService.list();
  for (let printer of printers) {
    await printerService.delete(printer.id);
  }
  octoPrintApiService.storeResponse(undefined, undefined);
});

describe(PrinterFilesController.name, () => {
  const gcodePath = "test/api/test-data/sample.gcode";
  const invalidGcodePath = "test/api/test-data/sample.gco";

  it(`should return 404 on ${defaultRoute} for nonexisting printer`, async () => {
    const res = await request.get(getRoute(101)).send();
    expectNotFoundResponse(res);
  });

  it(`should require 'recursive' on ${defaultRoute} for existing printer`, async () => {
    const printer = await createTestPrinter(request);
    const response = await request.get(getRoute(printer.id)).send();
    expectInvalidResponse(response, ["recursive"]);
  });

  it("should retrieve files on GET for existing printer", async () => {
    const printer = await createTestPrinter(request);
    octoPrintApiService.storeResponse([], 200);
    const response = await request.get(getFilesRoute(printer.id, false)).send();
    expectOkResponse(response, []);
  });

  it("should allow GET on printer files cache", async () => {
    const printer = await createTestPrinter(request);
    const response = await request.get(getCacheRoute(printer.id)).send();
    expectOkResponse(response);
  });

  it("should allow GET on printer files - tracked uploads", async () => {
    const response = await request.get(trackedUploadsRoute).send();
    expectOkResponse(response);
  });

  it("should allow GET on printer files - tracked uploads", async () => {
    const response = await request.get(trackedUploadsRoute).send();
    expectOkResponse(response);
  });

  it("should allow DELETE to clear printer files - with status result", async () => {
    const printer = await createTestPrinter(request);
    const jsonFile = require("./test-data/octoprint-file.data.json");
    octoPrintApiService.storeResponse({ files: [jsonFile] }, 200);
    const response = await request.delete(clearFilesRoute(printer.id)).send();
    expectOkResponse(response, {
      succeededFiles: expect.any(Array),
      failedFiles: expect.any(Array),
    });
    expect(response.body.succeededFiles).toHaveLength(1);
    expect(response.body.failedFiles).toHaveLength(0);
  });

  it("should allow POST to purge all printer files", async () => {
    await createTestPrinter(request);
    await createTestPrinter(request);
    const response = await request.post(purgeIndexedFilesRoute).send();
    expectOkResponse(response);
  });

  it("should allow POST to move a printer folder", async () => {
    const printer = await createTestPrinter(request);
    const response = await request.post(moveFileOrFolderRoute(printer.id)).send({
      filePath: "/test",
      destination: "/test2",
    });
    expectOkResponse(response);
  });

  it("should allow POST to create a printer folder", async () => {
    const printer = await createTestPrinter(request);
    const response = await request.post(createFolderRoute(printer.id)).send({
      foldername: "/test",
      path: "local",
    });
    expectOkResponse(response);
  });

  it("should allow DELETE to remove a printer file or folder", async () => {
    const printer = await createTestPrinter(request);
    const response = await request.delete(deleteFileOrFolderRoute(printer.id, "test")).send();
    expectOkResponse(response);
  });

  it("should allow POST to batch reprint many printer files", async () => {
    const printer = await createTestPrinter(request);
    const printer2 = await createTestPrinter(request);
    const response = await request.post(batchReprintRoute).send({
      printerIds: [printer.id, printer2.id],
    });
    expectOkResponse(response);
  });

  it("should allow POST to select and print a printer file", async () => {
    const printer = await createTestPrinter(request);
    const response = await request.post(selectAndPrintRoute(printer.id)).send({
      filePath: "file.gcode",
      print: false,
    });
    expectOkResponse(response);
  });

  it("should allow POST upload file", async () => {
    const printer = await createTestPrinter(request);

    const apiMock = nock(printer.printerURL);
    apiMock.post("/api/files/local").reply(200, {
      files: {
        local: {
          path: "file.gcode",
          name: "file.gcode",
        },
      },
    });
    octoPrintApiService.storeResponse(
      {
        DisplayLayerProgress: {
          totalLayerCountWithoutOffset: "19",
        },
        date: 1689190590,
        display: "file.gcode",
        gcodeAnalysis: {
          analysisFirstFilamentPrintTime: 11.23491561690389,
          analysisLastFilamentPrintTime: 7657.739990697696,
          analysisPending: false,
          analysisPrintTime: 7664.035725705694,
          compensatedPrintTime: 7811.063505072208,
          dimensions: {
            depth: 171.8769989013672,
            height: 3.799999952316284,
            width: 128.8769989013672,
          },
          estimatedPrintTime: 7811.063505072208,
          filament: {
            tool0: {
              length: 12463.312793658377,
              volume: 29.977780370085828,
            },
          },
          firstFilament: 0.00556784805395266,
          lastFilament: 0.9944192313637905,
          printingArea: {
            maxX: 188.8769989013672,
            maxY: 168.8769989013672,
            maxZ: 3.799999952316284,
            minX: 60.0,
            minY: -3.0,
            minZ: 0,
          },
          progress: [
            [0, 7811.063505072208],
            [0.00556784805395266, 7653.854021244996],
            [0.01320621941455919, 7593.79197685097],
            [0.01410743002697172, 7530.844623676129],
            [0.01455642026039588, 7470.536023434702],
            [0.01495557396225806, 7409.028711225408],
            [0.01532242620847821, 7346.264214477377],
            [0.01566436018891737, 7284.429856969582],
            [0.01601229301111862, 7219.549414058467],
            [0.01633807626373677, 7157.882416524522],
            [0.016653707630296, 7094.531201293892],
            [0.01696011000952893, 7029.862674971484],
            [0.01727758717355342, 6964.21809190855],
            [0.01756645447686639, 6903.970161935098],
            [0.01785716757764462, 6843.428986614591],
            [0.01814326618475971, 6782.824097027031],
            [0.01843397928553795, 6722.389344471061],
            [0.01872053934201935, 6662.365699204571],
            [0.01903986230350909, 6597.098899307273],
            [0.01936103106246409, 6532.953795792849],
            [0.01966881778979597, 6470.286072984583],
            [0.01998814075128571, 6409.471803654085],
            [0.02033192052919013, 6345.736348868218],
            [0.02067108581343141, 6285.315413723935],
            [0.02104162965458208, 6224.435903001451],
            [0.0214643172741263, 6161.594611155772],
            [0.02197329592517137, 6100.248825196983],
            [0.02926650315977454, 6040.2321621621595],
            [0.03281366443863531, 5980.066129843015],
            [0.03476559525814631, 5919.558591837709],
            [0.03677336145098139, 5858.954629944125],
            [0.04608817835940907, 5798.930538736397],
            [0.04868475394366165, 5738.903962922218],
            [0.05063437751634108, 5678.208904331847],
            [0.05264306660790878, 5618.122148913429],
            [0.06104744391659764, 5558.024901543451],
            [0.06328870348878793, 5497.999690338253],
            [0.06521202444758743, 5437.744997409371],
            [0.06732730834277381, 5377.3170418207965],
            [0.07793233767941728, 5317.272850373225],
            [0.08099682292111292, 5256.907237819563],
            [0.08447984273805596, 5196.547974341771],
            [0.08813775186483225, 5136.4116012855975],
            [0.09530682921989678, 5076.3969564391045],
            [0.10143856839948595, 5015.810582185256],
            [0.10490682183670691, 4955.344819678592],
            [0.10817849784387784, 4895.044397651906],
            [0.1121566528308765, 4834.822162730578],
            [0.12484881765136116, 4774.527003102223],
            [0.1280420472662586, 4714.419123581818],
            [0.13171749146895484, 4654.183814811249],
            [0.13507776575445818, 4594.076311067642],
            [0.1435781245313405, 4534.054295600623],
            [0.14828998401077945, 4473.835402268872],
            [0.15175639165053517, 4413.459486014979],
            [0.15493300908824528, 4353.4318859051555],
            [0.15948382273884043, 4293.2741246830665],
            [0.1714681242313984, 4233.158084094794],
            [0.17471303617532308, 4172.7748980601355],
            [0.17838709602992037, 4112.308521693066],
            [0.18171414596104907, 4052.105794927034],
            [0.1910621872238514, 3992.1040471337687],
            [0.2020811366420791, 3931.2483778210026],
            [0.20339811313354114, 3870.1717558039113],
            [0.20433024085349674, 3809.1615886750947],
            [0.2052171465355535, 3748.0282944853266],
            [0.2069946494945976, 3687.584646146766],
            [0.20920683775671006, 3626.9969314602845],
            [0.21104525203210764, 3565.0089091460914],
            [0.21195892177741066, 3503.750305478021],
            [0.21283521412404222, 3443.3076654123033],
            [0.21418726076734415, 3383.1252134408714],
            [0.2156962001951931, 3322.905620494499],
            [0.2317555610416758, 3262.801531196099],
            [0.24864506929815858, 3202.773426737169],
            [0.26518756763117274, 3142.746000445686],
            [0.2840617696121749, 3082.7340803731813],
            [0.301750969620481, 3022.718615493801],
            [0.3187636848577698, 2962.709596300977],
            [0.336300606575192, 2902.706332277674],
            [0.3552431030624087, 2842.677055637858],
            [0.3724136339829771, 2782.6626357396917],
            [0.38896028536028815, 2722.6486249363534],
            [0.4071718460512624, 2662.635414450301],
            [0.4219649898365777, 2602.6182778027924],
            [0.43494371471354376, 2542.536723272623],
            [0.4469640092566743, 2482.526099134082],
            [0.4591573473121728, 2422.438465606452],
            [0.4709561461594723, 2362.3936288510176],
            [0.4815371801290674, 2302.184888605685],
            [0.49614159112356, 2242.1330109882656],
            [0.5072906692630884, 2182.0121266836686],
            [0.5130574019939227, 2119.808686155884],
            [0.5157831834007434, 2059.776074147],
            [0.5318794601965313, 1999.6784524219577],
            [0.5451622802058987, 1939.636306288074],
            [0.5602332165097355, 1879.6160529690708],
            [0.574089618081432, 1819.4165213871177],
            [0.5895786275111498, 1759.2596195843073],
            [0.6057708857751312, 1699.1874314727131],
            [0.6170851627878002, 1639.1643857300462],
            [0.6322862278129376, 1579.1474764489988],
            [0.6476621821479084, 1519.0242566272348],
            [0.6629126222552415, 1459.0108406268757],
            [0.6768327038394895, 1398.9910121153664],
            [0.6916678395171394, 1338.986842742561],
            [0.7051407766654284, 1278.9721475704175],
            [0.7214760842329673, 1218.8720375825035],
            [0.7362955306321626, 1158.8657767783254],
            [0.7495128248315133, 1098.8274841968944],
            [0.7634864345422537, 1038.7744260121892],
            [0.7790322022440282, 978.585117538979],
            [0.7944847571738072, 918.5675228361052],
            [0.8084625199288445, 858.5473706648801],
            [0.821729189210391, 798.4998686788659],
            [0.8373187946019653, 738.4203713536791],
            [0.8526882886458076, 678.3399723464237],
            [0.8664740884644581, 618.1549518173034],
            [0.8837844385430198, 558.1508628457915],
            [0.8949127514610641, 498.1309006918893],
            [0.9087151634569017, 438.03289298025373],
            [0.920836053961889, 378.0293590873836],
            [0.9337137214276321, 317.9515489355019],
            [0.9459269018058821, 257.9402424183847],
            [0.9579545795388736, 197.9067411721482],
            [0.9724145568817097, 137.86686096193188],
            [0.9882939524753298, 77.78355728284184],
            [0.9934423430553024, 17.78153162482447],
            [0.9944192313637905, 7.3489461642040395],
            [1, 0],
          ],
        },
        hash: "a791a7c44a92e4c46827992a1c5a62281e5a2d13",
        name: "file.gcode",
        origin: "local",
        path: "file.gcode",
        prints: {
          failure: 0,
          last: {
            date: 1689197785.1172757,
            printTime: 7194.159933987998,
            success: true,
          },
          success: 1,
        },
        refs: {
          download: "http://minipi.local/downloads/files/local/file.gcode",
          resource: "http://minipi.local/api/files/local/file.gcode",
        },
        size: 2167085,
        statistics: {
          averagePrintTime: {
            _default: 7194.159933987998,
          },
          lastPrintTime: {
            _default: 7194.159933987998,
          },
        },
        thumbnail: "plugin/prusaslicerthumbnails/thumbnail/file.png?20230712213630",
        thumbnail_src: "prusaslicerthumbnails",
        type: "machinecode",
        typePath: ["machinecode", "gcode"],
      },

      200
    );
    const response = await request.post(uploadFileRoute(printer.id)).field("print", true).attach("file", gcodePath);
    expectOkResponse(response);
  });

  test.skip("should not allow POSTing multiple uploaded file", async () => {
    const printer = await createTestPrinter(request);

    nock(printer.printerURL)
      .post("/api/files/local")
      .reply(200, {
        files: {
          local: {
            path: "/home/yes",
            name: "3xP1234A_PLA_ParelWit_1h31m.gcode",
          },
        },
      })
      .persist();

    const response = await request
      .post(uploadFileRoute(printer.id))
      .field("print", true)
      .attach("file", gcodePath)
      .attach("file", gcodePath);
    expectInvalidResponse(response, ["error"]);
  });

  test.skip("should not allow POSTing wrong extensions", async () => {
    const printer = await createTestPrinter(request);

    nock(printer.printerURL)
      .post("/api/files/local")
      .reply(200, {
        files: {
          local: {
            path: "/home/yes",
            name: "3xP1234A_PLA_ParelWit_1h31m.gcode",
          },
        },
      })
      .persist();

    const response = await request.post(uploadFileRoute(printer.id)).field("print", true).attach("file", invalidGcodePath);
    console.log(response);
    expectInvalidResponse(response, ["error"]);
  });

  it("should deny POST to upload printer files when empty", async () => {
    const printer = await createTestPrinter(request);
    const response = await request.post(uploadFileRoute(printer.id)).send();
    expectInvalidResponse(response);
  });
});
