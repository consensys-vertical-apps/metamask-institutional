import fetchMock from "jest-fetch-mock";
import { MMI_CONFIGURATION_API_URL } from "../constants/constants";

import { ConfigurationClient } from "./ConfigurationClient";
fetchMock.enableMocks();

describe("ConfigurationClient", () => {
  let configurationClient: ConfigurationClient;

  beforeAll(() => {
    configurationClient = new ConfigurationClient();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    fetchMock.resetMocks();
  });

  describe("ConfigurationClient#getConfiguration", () => {
    it("should GET the configuration endpoint and return the response body", async () => {
      fetchMock.mockResponseOnce(JSON.stringify("test"));

      const result = await configurationClient.getConfiguration();
      expect(fetchMock).toHaveBeenCalledWith(MMI_CONFIGURATION_API_URL, {
        method: "GET",
      });

      expect(result).toEqual("test");
    });

    it("should fail if an exception is thrown by the HTTP client", async () => {
      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 400,
            data: "Fail",
          },
        };
      });

      expect(configurationClient.getConfiguration()).rejects.toThrow();
    });
  });

  describe("ConfigurationClient#getCustodianConfigurationForApiUrl", () => {
    it("should call getConfiguration and return the custodians for this specific API URL ", async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          custodians: [
            {
              apiBaseUrl: "https://api.mymmi.com",
              refreshTokenUrl: "test",
              websocketApiUrl: "test",
            },
          ],
        })
      );

      const result = await configurationClient.getCustodianConfigurationForApiUrl(
        "https://api.mymmi.com"
      );
      expect(fetchMock).toHaveBeenCalledWith(MMI_CONFIGURATION_API_URL, {
        method: "GET",
      });

      expect(result).toEqual({
        refreshTokenUrl: "test",
        websocketApiUrl: "test",
      });
    });

    it("should fail there is no such custodian config", async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          custodians: [
            {
              apiBaseUrl: "https://api.mymmi.com",
            },
          ],
        })
      );

      expect(
        configurationClient.getCustodianConfigurationForApiUrl(
          "http://not-real"
        )
      ).rejects.toThrow();
    });
  });

  describe("ConfigurationClient#constructor", () => {
    it("should use the dev configuration API by default", () => {
      const client = new ConfigurationClient();
      expect(client.configurationApiUrl).toEqual(MMI_CONFIGURATION_API_URL);
    });

    it("should use a specifed configuration API URL if present", () => {
      const client = new ConfigurationClient("http://test.com");
      expect(client.configurationApiUrl).toEqual("http://test.com");
    });
  });
});
