import { Compliance } from "./Compliance";
import { Auth0 } from "./Auth0";
import { InstitutionalFeaturesController } from "./institutional-features";

jest.mock("@auth0/auth0-spa-js", () => {
  return {
    Auth0: jest.fn().mockImplementation(() => ({
      loginWithPopup: jest.fn(),
      getUser: jest.fn(() => "user"),
      getTokenSilently: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: jest.fn(),
    })),
  };
});
Auth0.prototype.createClient = jest.fn(() => Promise.resolve("mock"));
Compliance.prototype.getTenantSubdomain = jest.fn(() => Promise.resolve("subdomain"));
Compliance.prototype.generateReportForAddress = jest.fn(async address => ({
  address,
  reportId: "complianceReportId",
}));

describe("InstitutionalFeaturesController", function () {
  (<any>global).chrome = {
    runtime: {
      id: "extensionId",
    },
  };

  const INIT_STATE = {
    institutionalFeatures: {
      complianceProjectId: "testProjectId",
      complianceClientId: "testClientId",
      connectRequests: [],
      reportsInProgress: {},
    },
  };

  const createController = async initState => {
    return await new InstitutionalFeaturesController({
      initState,
      showConfirmRequest: () => "mock",
    });
  };

  it("should create complianceClient", async function () {
    const controller = await createController(INIT_STATE);
    expect(controller.complianceClient).toBeTruthy();
  });

  it("should set projectId and clientId", async function () {
    const controller = await createController(INIT_STATE);
    await controller.setComplianceAuthData({
      clientId: "newClientId",
      projectId: "newProjectId",
    });
    const state = controller.store.getState();
    expect(state.institutionalFeatures.complianceClientId).toBe("newClientId");
    expect(controller.getComplianceProjectId()).toBe("newProjectId");
  });

  it("should remove projectId and clientId", async function () {
    const controller = await createController(INIT_STATE);
    await controller.deleteComplianceAuthData();
    const state = controller.store.getState();
    expect(state.institutionalFeatures.complianceClientId).toBe(undefined);
    expect(controller.getComplianceProjectId()).toBe(undefined);
  });

  it("should add compliance report object to reportsInProgress", async function () {
    const controller = await createController(INIT_STATE);
    await controller.generateComplianceReport("address");
    const state = controller.store.getState();
    expect(state.institutionalFeatures.reportsInProgress.address[0]).toStrictEqual({
      address: "address",
      progress: 0,
      reportId: "complianceReportId",
    });
  });

  it("should add connectRequest and call showConfirmRequest function", async function () {
    const controller = await createController(INIT_STATE);
    const connectRequest = {
      origin: "origin",
      method: "custodian",
      params: {
        labels: [],
        feature: "compliance",
        service: "codefi-compliance",
        token: "token",
        apiUrl: "https://api-url",
      },
    };
    jest.spyOn(controller, "showConfirmRequest");
    await controller.handleMmiAuthenticate(connectRequest);
    expect(controller.showConfirmRequest).toHaveBeenCalled();
    const state = controller.store.getState();
    expect(state.institutionalFeatures.connectRequests[0]).toStrictEqual({
      origin: "origin",
      labels: [],
      feature: "compliance",
      service: "codefi-compliance",
      token: "token",
    });
  });

  it("should add connectRequest and call showConfirmRequest function", async function () {
    const controller = await createController(INIT_STATE);
    const connectRequest = {
      origin: "origin",
      method: "custodian",
      params: {
        labels: [],
        feature: "custodian",
        service: "jupiter",
        token: "token",
        apiUrl: "https://api-url",
        environment: "test-environment",
      },
    };
    jest.spyOn(controller, "showConfirmRequest");
    await controller.handleMmiAuthenticate(connectRequest);
    expect(controller.showConfirmRequest).toHaveBeenCalled();
    const state = controller.store.getState();
    expect(state.institutionalFeatures.connectRequests[0]).toStrictEqual({
      origin: "origin",
      method: "custodian",
      labels: [],
      feature: "custodian",
      service: "jupiter",
      token: "token",
      apiUrl: "https://api-url",
      chainId: undefined,
      environment: "test-environment",
    });
  });

  it("should throw Missing parameter: feature", async function () {
    const controller = await createController(INIT_STATE);
    const connectRequest = {
      origin: "origin",
      method: "custodian",
      params: {
        labels: [],
        service: "codefi-compliance",
        token: "token",
        feature: undefined,
      },
    };
    expect(() => controller.handleMmiAuthenticate(connectRequest)).toThrow("Missing parameter: feature");
  });

  it("should throw Missing parameter: service", async function () {
    const controller = await createController(INIT_STATE);
    const connectRequest = {
      origin: "origin",
      method: "custodian",
      params: {
        labels: [],
        feature: "feature",
        token: "token",
        service: undefined,
      },
    };
    expect(() => controller.handleMmiAuthenticate(connectRequest)).toThrow("Missing parameter: service");
  });

  it("should throw Missing parameter: token", async function () {
    const controller = await createController(INIT_STATE);
    const connectRequest = {
      origin: "origin",
      method: "custodian",
      params: {
        labels: [],
        feature: "feature",
        service: "codefi-compliance",
        token: undefined,
      },
    };
    expect(() => controller.handleMmiAuthenticate(connectRequest)).toThrow("Missing parameter: token");
  });

  it("should remove connectRequest", async function () {
    const controller = await createController({
      institutionalFeatures: {
        ...INIT_STATE.institutionalFeatures,
        connectRequests: [
          {
            origin: "origin",
            labels: [],
            feature: "feature",
            service: "codefi-compliance",
            token: {
              projectId: "projectId",
            },
          },
        ],
      },
    });
    await controller.removeConnectInstitutionalFeature({
      origin: "origin",
      projectId: "projectId",
    });
    const state = controller.store.getState();
    expect(state.institutionalFeatures.connectRequests).toStrictEqual([]);
  });

  it("should call complianceClient.getHistoricalReportsForAddress", async function () {
    const controller = await createController(INIT_STATE);
    controller.complianceClient.getHistoricalReportsForAddress = jest.fn(() =>
      Promise.resolve({
        items: [
          {
            reportId: "reportId",
            address: "address",
            risk: "risk",
            status: "status",
            reportVersion: 1,
            createTime: "date",
          },
        ],
        total: 1,
        links: [],
      }),
    );
    jest.spyOn(controller.complianceClient, "getHistoricalReportsForAddress");
    await controller.getComplianceHistoricalReportsByAddress("address", "projectId");
    expect(controller.complianceClient.getHistoricalReportsForAddress).toBeCalled();
  });

  it("should update reportsInProgress", async function () {
    const controller = await createController({
      institutionalFeatures: {
        ...INIT_STATE.institutionalFeatures,
        reportsInProgress: {
          address: [
            {
              reportId: "test",
              address: "address",
              progress: 2,
              status: "inProgress",
            },
          ],
        },
      },
    });
    controller.complianceClient.addReportToQueue = jest.fn(() => true);
    await controller.syncReportsInProgress({
      address: "address2",
      historicalReports: [
        {
          address: "address2",
          reportId: "test2",
          progress: 1,
          status: "inProgress",
        },
      ],
    });
    const state = controller.store.getState();
    expect(Object.keys(state.institutionalFeatures.reportsInProgress).length).toBe(2);
  });

  it("should handle emitted event and update reportsInProgress", async function () {
    const controller = await createController({
      institutionalFeatures: {
        ...INIT_STATE.institutionalFeatures,
        reportsInProgress: {
          address: [
            {
              reportId: "test",
              address: "address",
              progress: 2,
              status: "inProgress",
            },
          ],
        },
      },
    });
    await controller.handleReportProgress({
      address: "address",
      reportId: "test",
      progressPercent: 10,
    });
    const state = controller.store.getState();
    expect(state.institutionalFeatures.reportsInProgress.address[0].progress).toBe(10);
  });

  it("should handle emitted event and remove report from reportsInProgress", async function () {
    const controller = await createController({
      institutionalFeatures: {
        ...INIT_STATE.institutionalFeatures,
        reportsInProgress: {
          address: [
            {
              reportId: "test",
              address: "address",
              progress: 2,
              status: "inProgress",
            },
          ],
        },
      },
    });
    await controller.handleReportComplete({
      address: "address",
      reportId: "test",
    });
    const state = controller.store.getState();
    expect(state.institutionalFeatures.reportsInProgress.address.length).toBe(0);
  });

  it("should add connectRequests with custodian token connect request", async function () {
    const controller = await createController({
      institutionalFeatures: INIT_STATE.institutionalFeatures,
    });
    await controller.authenticateToCodefiCompliance(
      "testOrigin.com",
      "token",
      [{ key: "key", value: "value" }],
      "custodian",
      "Jupiter",
    );
    const state = controller.store.getState();
    expect(state.institutionalFeatures.connectRequests.length).toBe(1);
  });

  it("should remove connectRequests", async function () {
    const controller = await createController({
      institutionalFeatures: {
        ...INIT_STATE.institutionalFeatures,
        connectRequests: [{ origin: "testOrigin.com", token: "token", apiUrl: "http://" }],
      },
    });
    await controller.removeAddTokenConnectRequest({
      origin: "testOrigin.com",
      apiUrl: "http://",
      token: "token",
    });
    const state = controller.store.getState();
    expect(state.institutionalFeatures.connectRequests.length).toBe(0);
  });

  it("should not remove connectRequests where apiUrl is different", async function () {
    const controller = await createController({
      institutionalFeatures: {
        ...INIT_STATE.institutionalFeatures,
        connectRequests: [{ origin: "testOrigin.com", token: "token", apiUrl: "http://" }],
      },
    });
    await controller.removeAddTokenConnectRequest({
      origin: "testOrigin.com",
      apiUrl: "not-the-same",
      token: "token",
    });
    const state = controller.store.getState();
    expect(state.institutionalFeatures.connectRequests.length).toBe(1);
  });

  it("should not remove connectRequests where token is different", async function () {
    const controller = await createController({
      institutionalFeatures: {
        ...INIT_STATE.institutionalFeatures,
        connectRequests: [{ origin: "testOrigin.com", token: "token", apiUrl: "http://" }],
      },
    });
    await controller.removeAddTokenConnectRequest({
      origin: "testOrigin.com",
      apiUrl: "http://",
      token: "not-token",
    });
    const state = controller.store.getState();
    expect(state.institutionalFeatures.connectRequests.length).toBe(1);
  });
});
