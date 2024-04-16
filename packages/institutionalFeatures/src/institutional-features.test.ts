import { ConnectionRequest, ConnectRequest } from "@metamask-institutional/types";

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
      channelId: null,
      connectionRequest: null,
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

  it("should set the channelId in the state", async function () {
    const controller = await createController(INIT_STATE);
    const channelId = "channel-123";
    controller.setChannelId(channelId);
    const state = controller.store.getState();
    expect(state.institutionalFeatures.channelId).toBe(channelId);
  });

  it("should set a connection request in the state", async function () {
    const controller = await createController(INIT_STATE);
    const connectionRequest: ConnectionRequest = {
      payload: "payload",
      traceId: "traceId",
      channelId: "channelId",
    };
    controller.setConnectionRequest(connectionRequest);
    const state = controller.store.getState();
    expect(state.institutionalFeatures.connectionRequest).toStrictEqual(connectionRequest);
  });

  it("should add a connect request to the beginning of the connect requests array", async function () {
    const connectRequest: ConnectRequest = {
      channelId: "channelId",
      traceId: "traceId",
      token: "token",
      environment: "environment",
      feature: "feature",
      service: "service",
    };
    const controller = await createController({
      institutionalFeatures: {
        ...INIT_STATE.institutionalFeatures,
        connectRequests: [connectRequest],
      },
    });

    controller.setConnectRequests(connectRequest);
    const state = controller.store.getState();
    expect(state.institutionalFeatures.connectRequests.length).toBe(2);
    expect(state.institutionalFeatures.connectRequests[0]).toStrictEqual(connectRequest);
  });

  it("should not set an undefined channelId", async function () {
    const controller = await createController(INIT_STATE);
    controller.setChannelId(undefined);
    const state = controller.store.getState();
    expect(state.institutionalFeatures.channelId).toBeUndefined();
  });

  it("should handle an empty connectRequest when adding a new request", async function () {
    const controller = await createController({
      institutionalFeatures: {
        ...INIT_STATE.institutionalFeatures,
        connectRequests: [],
      },
    });
    const connectRequest: ConnectRequest = {
      channelId: "channelId",
      traceId: "traceId",
      token: "token",
      environment: "environment",
      feature: "feature",
      service: "service",
    };
    controller.setConnectRequests(connectRequest);
    const state = controller.store.getState();
    expect(state.institutionalFeatures.connectRequests.length).toBe(1);
    expect(state.institutionalFeatures.connectRequests[0]).toStrictEqual(connectRequest);
  });
});
