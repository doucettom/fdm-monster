const DITokens = require("../../../server/container.tokens");
const { configureContainer } = require("../../../server/container");

let container;
let dashboardStatisticsCache;

beforeEach(() => {
  container = configureContainer();
  dashboardStatisticsCache = container.resolve(DITokens.dashboardStatisticsCache);
});

describe(DITokens.dashboardStatisticsCache, function () {
  it("should be resolved", () => {
    expect(dashboardStatisticsCache).toBeTruthy();
  });

  test.skip("should call statisticsStart no problem", async () => {
    await dashboardStatisticsCache.statisticsStart();
  });

  test.skip("should generate printer statistics without errors", async () => {
    // TODO does not throw any error because of input validation right now
    const returnedStats = await dashboardStatisticsCache.generatePrinterStatistics();
    expect(returnedStats).toBeTruthy();
  });
});
