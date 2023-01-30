import { Compliance } from "./Compliance";
import { COMPLIANCE_API_URL } from "./constants";
import { ComplianceError } from "./ComplianceError";
import fetchMock from "jest-fetch-mock";

import * as Auth0 from "./Auth0";

fetchMock.enableMocks();

jest.mock("./Auth0", () => {
  return {
    Auth0: jest.fn().mockImplementation(() => ({
      getAccessToken: jest.fn(() => Promise.resolve("token")),
    })),
  };
});

jest.mock("./TimerService");

describe("#Compliance", () => {
  let complianceClient: Compliance;
  const auth0 = new Auth0.Auth0();

  beforeAll(() => {
    complianceClient = new Compliance("clientId", auth0);
  });

  beforeEach(() => {
    fetchMock.mockClear();
    jest.clearAllMocks();
  });

  describe("startPolling", () => {
    it("should set polling to true", () => {
      complianceClient.startPolling();
      expect(complianceClient.polling).toBe(true);
    });
  });

  describe("stopPolling", () => {
    it("should set polling to false", () => {
      complianceClient.stopPolling();
      expect(complianceClient.polling).toBe(false);
    });
  });

  describe("poll", () => {
    it("should check for the activity of reports in progress and emit a progress event if it is not complete", async () => {
      complianceClient.startPolling();

      fetchMock.mockResponseOnce(JSON.stringify({ data: { progressPercent: 50 } }));

      const reportId = "123";
      const address = "456";

      complianceClient.addReportToQueue({ reportId, address });

      const messageHandler = jest.fn();

      complianceClient.on("report-progress", messageHandler);

      await complianceClient.poll();

      expect(fetchMock).toHaveBeenCalledWith(
        COMPLIANCE_API_URL + `/projects/clientId/reports/aml/${reportId}/activity`,
        {
          headers: {
            Authorization: "Bearer token",
          },
        },
      );

      await new Promise((resolve, _reject) => {
        setTimeout(() => {
          expect(messageHandler).toHaveBeenCalledWith({
            address,
            progressPercent: 50,
            reportId,
          });
          resolve(null);
        }, 100);
      });
    });

    it("should check for the activity of reports in progress and emit a complete if it is complete", async () => {
      complianceClient.startPolling();

      fetchMock.mockResponseOnce(JSON.stringify({ data: { reportId: "123" } }));

      const reportId = "123";
      const address = "456";

      complianceClient.addReportToQueue({ reportId, address });

      const messageHandler = jest.fn();

      complianceClient.on("report-complete", messageHandler);

      await complianceClient.poll();

      expect(fetchMock).toHaveBeenCalledWith(
        COMPLIANCE_API_URL + `/projects/clientId/reports/aml/${reportId}/activity`,
        {
          headers: {
            Authorization: "Bearer token",
          },
        },
      );

      await new Promise((resolve, _reject) => {
        setTimeout(() => {
          expect(messageHandler).toHaveBeenCalledWith({
            address,
            report: {
              reportId,
            },
            reportId,
          });
          resolve(null);
        }, 100);
      });
    });

    it("should not add a report to the queue if the reportId is undefined", async () => {
      complianceClient.stopPolling();

      const reportId = undefined;
      const address = "456";

      complianceClient.addReportToQueue({ reportId, address });

      const messageHandler = jest.fn();

      complianceClient.on("report-complete", messageHandler);

      await complianceClient.poll();

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("should do nothing if polling is turned off", async () => {
      complianceClient.stopPolling();

      const reportId = "123";
      const address = "456";

      complianceClient.addReportToQueue({ reportId, address });

      const messageHandler = jest.fn();

      complianceClient.on("report-complete", messageHandler);

      await complianceClient.poll();

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("should emit an error event if there is an error requesting the activity", async () => {
      complianceClient.stopPolling();
      complianceClient.startPolling();

      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 400,
            data: { message: "fail" },
          },
        };
      });

      const reportId = "666";
      const address = "456";

      complianceClient.addReportToQueue({ reportId, address });

      const errorHandler = jest.fn();

      complianceClient.on("error", errorHandler);

      await complianceClient.poll();

      expect(fetchMock).toHaveBeenCalledWith(
        COMPLIANCE_API_URL + `/projects/clientId/reports/aml/${reportId}/activity`,
        {
          headers: {
            Authorization: "Bearer token",
          },
        },
      );

      await new Promise((resolve, _reject) => {
        setTimeout(() => {
          expect(errorHandler).toHaveBeenCalledWith({
            address,
            errorMessage: "400: fail",
            reportId,
          });
          resolve(null);
        }, 100);
      });
    });

    it("should not poll a second time if the error is 500", async () => {
      complianceClient.stopPolling();
      complianceClient.startPolling();

      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 500,
            data: { message: "fail" },
          },
        };
      });

      const reportId = "123";
      const address = "456";

      complianceClient.addReportToQueue({ reportId, address });

      const errorHandler = jest.fn();

      complianceClient.on("error", errorHandler);

      await complianceClient.poll();

      await complianceClient.poll();

      expect(fetchMock).toHaveBeenCalledTimes(1);

      complianceClient.stopPolling();
    });

    it("should not poll a second time if the error is 424", async () => {
      complianceClient.stopPolling();
      complianceClient.startPolling();

      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 500,
            data: { message: "fail" },
          },
        };
      });

      const reportId = "123";
      const address = "456";

      complianceClient.addReportToQueue({ reportId, address });

      const errorHandler = jest.fn();

      complianceClient.on("error", errorHandler);

      await complianceClient.poll();

      await complianceClient.poll();

      expect(fetchMock).toHaveBeenCalledTimes(1);

      complianceClient.stopPolling();
    });

    it("should not poll a second time if the error is 404", async () => {
      complianceClient.stopPolling();
      complianceClient.startPolling();

      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 404,
            data: { message: "fail" },
          },
        };
      });

      const reportId = "123";
      const address = "456";

      complianceClient.addReportToQueue({ reportId, address });

      const errorHandler = jest.fn();

      complianceClient.on("error", errorHandler);

      await complianceClient.poll();

      await complianceClient.poll();

      expect(fetchMock).toHaveBeenCalledTimes(1);

      complianceClient.stopPolling();
    });
  });

  describe("getRandomEthereumAddressFromDb", () => {
    it("should GET /addresses/random", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ address: "0xtest" }));

      const result = await complianceClient.getRandomEthereumAddressFromDb();

      expect(result).toEqual("0xtest");

      expect(fetchMock).toHaveBeenCalledWith(COMPLIANCE_API_URL + "/addresses/random", {
        headers: {
          Authorization: "Bearer token",
        },
      });
    });

    it("should throw a ComplianceError when it fails", async () => {
      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 400,
            data: { message: "fail" },
          },
        };
      });

      expect(complianceClient.getRandomEthereumAddressFromDb()).rejects.toThrow(ComplianceError);
    });
  });

  describe("generateReportForAddress", () => {
    it("should GET /reports/aml/addresses/{address}", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ data: { reportId: "123" } }));

      const address = "0xtest";
      const result = await complianceClient.generateReportForAddress(address);

      expect(result).toEqual({ reportId: "123" });

      expect(fetchMock).toHaveBeenCalledWith(
        COMPLIANCE_API_URL + `/projects/clientId/reports/aml/addresses/${address}`,
        {
          headers: {
            Authorization: "Bearer token",
          },
        },
      );
    });

    it("should throw a ComplianceError when it fails", async () => {
      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 400,
            data: { message: "fail" },
          },
        };
      });

      expect(complianceClient.generateReportForAddress("0x123")).rejects.toThrow(ComplianceError);
    });
  });

  describe("getReportActivityData", () => {
    it("should GET /reports/aml/{reportId}/activity", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ data: {} }));

      const reportId = "123";
      const result = await complianceClient.getReportActivityData(reportId);

      expect(result).toEqual({});

      expect(fetchMock).toHaveBeenCalledWith(
        COMPLIANCE_API_URL + `/projects/clientId/reports/aml/${reportId}/activity`,
        {
          headers: {
            Authorization: "Bearer token",
          },
        },
      );
    });

    it("should throw a ComplianceError when it fails", async () => {
      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 400,
            data: { message: "fail" },
          },
        };
      });

      expect(complianceClient.getReportActivityData("000")).rejects.toThrow(ComplianceError);
    });
  });

  describe("getHistoricalReportsForAddress", () => {
    it("should GET /reports/aml/{reportId}/activity", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ data: {} }));

      const address = "0x123";
      const result = await complianceClient.getHistoricalReportsForAddress(address);

      expect(result).toEqual({});

      expect(fetchMock).toHaveBeenCalledWith(COMPLIANCE_API_URL + `/projects/clientId/reports/aml?address=${address}`, {
        headers: {
          Authorization: "Bearer token",
        },
      });
    });

    it("should throw a ComplianceError when it fails", async () => {
      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 400,
            data: { message: "fail" },
          },
        };
      });

      const address = "0x123";

      expect(complianceClient.getHistoricalReportsForAddress(address)).rejects.toThrow(ComplianceError);
    });
  });

  describe("getTenantSubdomain", () => {
    it("should GET /tenants/me", async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          uuid: "e191dd32-bf76-4d69-bc9e-04ce2139c5eb",
          name: "MMITEST",
          clientId: "5kQHg48BQJR2QuGTs1EX4V5OJZI8RA2k",
        }),
      );

      const result = await complianceClient.getTenantSubdomain();

      expect(result).toEqual("mmitest");

      expect(fetchMock).toHaveBeenCalledWith(COMPLIANCE_API_URL + `/tenants/me`, {
        headers: {
          Authorization: "Bearer token",
        },
      });
    });

    it("should throw a ComplianceError when it fails", async () => {
      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 400,
            data: { message: "fail" },
          },
        };
      });

      expect(complianceClient.getTenantSubdomain()).rejects.toThrow(ComplianceError);
    });
  });
});
