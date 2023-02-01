import fetchMock from "jest-fetch-mock";

import { setDashboardCookie } from "./utils";

fetchMock.enableMocks();

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.resetMocks();
});

describe("#setDashboardCookie", () => {
  it("should call dev set cookie endpoint", async () => {
    const testData = {
      accounts: [{ address: "test", name: "test", custodyType: null }],
      networks: [1],
      metrics: {
        metaMetricsId: "mmId",
        extensionId: "extId",
      },
    };

    fetchMock.mockImplementationOnce(() => {
      throw {
        response: {
          status: 200,
        },
      };
    });
    await setDashboardCookie(testData, ["test"]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns false if it fails", async () => {
    const testData = {
      accounts: [{ address: "test", name: "test", custodyType: null }],
      networks: [1],
      metrics: {
        metaMetricsId: "mmId",
        extensionId: "extId",
      },
    };
    fetchMock.mockRejectedValueOnce(new Error("test"));
    const result = await setDashboardCookie(testData, ["test"]);

    expect(result).toBeFalsy();
  });
});
