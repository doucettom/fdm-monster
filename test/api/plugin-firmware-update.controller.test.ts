import { AppConstants } from "@/server.constants";
import { setupTestApp } from "../test-server";
import { expectOkResponse, expectInternalServerError } from "../extensions";
import { createTestPrinter } from "./test-data/create-printer";
import supertest from "supertest";
import { AxiosMock } from "../mocks/axios.mock";
import { PluginFirmwareUpdateController } from "@/controllers/plugin-firmware-update.controller";

const defaultRoute = AppConstants.apiRoute + "/plugin/firmware-update";
const listRoute = `${defaultRoute}/`;
const scanRoute = `${defaultRoute}/scan`;
const releasesRoute = `${defaultRoute}/releases`;
const syncReleasesRoute = `${defaultRoute}/releases/sync`;
const downloadFirmwareRoute = `${defaultRoute}/download-firmware`;
const isPluginInstalledRoute = (id: string) => `${defaultRoute}/${id}/is-plugin-installed`;
const installPluginRoute = (id: string) => `${defaultRoute}/${id}/install-firmware-update-plugin`;
const pluginStatusRoute = (id: string) => `${defaultRoute}/${id}/status`;
const configurePluginSettingsRoute = (id: string) => `${defaultRoute}/${id}/configure-plugin-settings`;
const flashFirmwareRoute = (id: string) => `${defaultRoute}/${id}/flash-firmware`;

let request: supertest.SuperTest<supertest.Test>;
let httpClient: AxiosMock;

beforeAll(async () => {
  ({ request, httpClient } = await setupTestApp(true));
});

describe(PluginFirmwareUpdateController.name, () => {
  it(`should be able to GET ${listRoute} empty cache`, async () => {
    const response = await request.get(listRoute).send();
    expectOkResponse(response);
  });

  it(`should be able to POST ${scanRoute} to perform scan`, async () => {
    await createTestPrinter(request);
    const response = await request.post(scanRoute).send();
    expectOkResponse(response);
  });

  it("should query github releases", async () => {
    httpClient.saveMockResponse(require("./test-data/prusa-github-releases.data.json"), 200);
    const syncResponse = await request.post(syncReleasesRoute).send();
    expectOkResponse(syncResponse);
    expect(syncResponse.body).toHaveLength(30);
  });

  it("should indicate plugin is installed", async () => {
    const testPrinter = await createTestPrinter(request);
    httpClient.saveMockResponse({ plugins: [{ key: "firmwareupdater" }] }, 200);
    const response = await request.get(isPluginInstalledRoute(testPrinter.id)).send();
    expectOkResponse(response);
    expect(response.body.isInstalled).toBeTruthy();
  });

  it("should not install plugin when already installed", async () => {
    const testPrinter = await createTestPrinter(request);
    httpClient.saveMockResponse({ plugins: [{ key: "firmwareupdater" }] }, 200);
    const response = await request.post(installPluginRoute(testPrinter.id)).send();
    expectOkResponse(response, {
      isInstalled: true,
      installing: false,
    });
  });

  it("should get idle firmware updater status", async () => {
    const testPrinter = await createTestPrinter(request);
    httpClient.saveMockResponse({ flashing: false }, 200);
    const response = await request.get(pluginStatusRoute(testPrinter.id)).send();
    expectOkResponse(response, { flashing: false });
  });

  it("should configure plugin settings", async () => {
    const testPrinter = await createTestPrinter(request);
    httpClient.saveMockResponse({ plugins: [] }, 200);
    const response = await request.post(configurePluginSettingsRoute(testPrinter.id)).send();
    expectOkResponse(response);
  });

  it("should not trigger flash firmware action on illegal files", async () => {
    const testPrinter = await createTestPrinter(request);
    httpClient.saveMockResponse({ flashing: true }, 200);
    const response = await request.post(flashFirmwareRoute(testPrinter.id)).send();
    expect(response).not.toBe(200);
  });

  // This is too intrusive still (needs fs isolation)
  test.skip(`should be able to POST ${downloadFirmwareRoute} to let server download firmware`, async () => {
    httpClient.saveMockResponse(require("./test-data/prusa-github-releases.data.json"), 200);
    const syncResponse = await request.post(syncReleasesRoute).send();
    expectOkResponse(syncResponse);
    expect(syncResponse.body).toHaveLength(16);

    const releasesResponse = await request.get(releasesRoute).send();
    expectOkResponse(releasesResponse);
    expect(releasesResponse.body).toHaveLength(16);

    httpClient.saveMockResponse([], 200, false, false);
    const response = await request.post(downloadFirmwareRoute).send();
    expectInternalServerError(response);

    const response2 = await request.post(downloadFirmwareRoute).send();
    expectOkResponse(response2);
  });
});
