import { InstitutionalFeaturesController } from "./institutional-features";

describe("InstitutionalFeaturesController", function () {
  global.chrome = {
    runtime: {
      id: "extensionId",
    },
  };

  const INIT_STATE = {
    institutionalFeatures: {
      connectRequests: [],
    },
  };

  const createController = async initState => {
    return await new InstitutionalFeaturesController({
      initState,
      showConfirmRequest: () => "mock",
    });
  };

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
        service: "custodian",
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
        service: "custodian",
        token: undefined,
      },
    };
    expect(() => controller.handleMmiAuthenticate(connectRequest)).toThrow("Missing parameter: token");
  });

  it("should remove connectRequests", async function () {
    const controller = await createController({
      institutionalFeatures: {
        ...INIT_STATE.institutionalFeatures,
        connectRequests: [{ origin: "testOrigin.com", token: "token", environment: "test-environment" }],
      },
    });
    await controller.removeAddTokenConnectRequest({
      origin: "testOrigin.com",
      environment: "test-environment",
      token: "token",
    });
    const state = controller.store.getState();
    expect(state.institutionalFeatures.connectRequests.length).toBe(0);
  });

  it("should not remove connectRequests where environment is different", async function () {
    const controller = await createController({
      institutionalFeatures: {
        ...INIT_STATE.institutionalFeatures,
        connectRequests: [{ origin: "testOrigin.com", token: "token", environment: "test-environment" }],
      },
    });
    await controller.removeAddTokenConnectRequest({
      origin: "testOrigin.com",
      environment: "not-the-same",
      token: "token",
    });
    const state = controller.store.getState();
    expect(state.institutionalFeatures.connectRequests.length).toBe(1);
  });

  it("should not remove connectRequests where token is different", async function () {
    const controller = await createController({
      institutionalFeatures: {
        ...INIT_STATE.institutionalFeatures,
        connectRequests: [{ origin: "testOrigin.com", token: "token", environment: "test-environment" }],
      },
    });
    await controller.removeAddTokenConnectRequest({
      origin: "testOrigin.com",
      environment: "test-environment",
      token: "not-token",
    });
    const state = controller.store.getState();
    expect(state.institutionalFeatures.connectRequests.length).toBe(1);
  });
});
