import { CUSTODIAN_TYPES } from "./custodianTypes";
import { IMmiConfigurationControllerOptions } from "./interfaces/IMmiConfigurationControllerOptions";
import { MmiConfigurationController } from "./MmiConfiguration";

const missingV1Custodian = {
  apiBaseUrl: "",
  displayName: "Legacy",
  iconUrl: "images/test.svg",
  name: "legacy",
  production: true,
  type: "Legacy",
  enabled: true,
  refreshTokenUrl: "https://test",
  isNoteToTraderSupported: true,
};

const v1custodianWithNoteSupport = {
  apiBaseUrl: "",
  displayName: "Qredo",
  iconUrl: "images/test.svg",
  name: "qredo",
  production: true,
  type: "Qredo",
  enabled: true,
  refreshTokenUrl: "https://test",
  isNoteToTraderSupported: true,
};

const v2custodian = {
  apiBaseUrl: "https://test",
  displayName: "Test Custody",
  iconUrl: "images/test.svg",
  name: "test",
  production: true,
  type: "test",
  enabled: true,
  refreshTokenUrl: "https://test",
  websocketApiUrl: "wss://test",
  isNoteToTraderSupported: false,
};

jest.mock("@metamask-institutional/configuration-client", () => {
  return {
    ConfigurationClient: jest.fn().mockImplementation(() => ({
      getConfiguration: jest.fn().mockResolvedValue({
        portfolio: {
          enabled: true,
          url: "http://test",
          cookieSetUrls: ["test"],
        },
        features: {
          websocketApi: false,
        },
        custodians: [missingV1Custodian, v1custodianWithNoteSupport, v2custodian],
      }),
    })),
  };
});

describe("MmiConfigurationController", () => {
  const initState = {
    mmiConfiguration: {
      portfolio: {
        enabled: false,
        url: "",
        cookieSetUrls: [],
      },
      features: {
        websocketApi: false,
      },
      custodians: [],
    },
  };

  const options: IMmiConfigurationControllerOptions = { initState };

  const createController = async options => {
    return await new MmiConfigurationController(options);
  };

  it("should create configurationClient", async function () {
    const controller = await createController(options);
    expect(controller.configurationClient).toBeTruthy();
  });

  it("should get the configuration from the client and store it. The custodian list should include the V1 custodians from the hardcoded list, and any v2 custodians from the configuration client", async () => {
    const controller = await createController(options);
    jest.spyOn(controller, "getConfiguration");
    await controller.storeConfiguration();

    expect(controller.getConfiguration).toHaveBeenCalled();

    expect(controller.store.getState().mmiConfiguration).toEqual({
      portfolio: {
        enabled: true,
        url: "http://test",
        cookieSetUrls: ["test"],
      },
      features: {
        websocketApi: false,
      },
      custodians: [
        ...Object.values(CUSTODIAN_TYPES)
          .filter(custodian => custodian.hidden === false)
          .map(custodian => ({
            type: custodian.name,
            name: custodian.name.toLowerCase(),
            apiUrl: custodian.apiUrl,
            iconUrl: custodian.imgSrc,
            displayName: custodian.displayName,
            production: custodian.production,
            refreshTokenUrl: null,
            websocketApiUrl: null,
            isNoteToTraderSupported: custodian.name.toLowerCase() === v1custodianWithNoteSupport.name ? true : false,
            version: 1,
          })),
        {
          type: "JSONRPC",
          name: v2custodian.name,
          apiUrl: v2custodian.apiBaseUrl,
          iconUrl: v2custodian.iconUrl,
          displayName: v2custodian.displayName,
          production: v2custodian.production,
          refreshTokenUrl: v2custodian.refreshTokenUrl,
          isNoteToTraderSupported: v2custodian.isNoteToTraderSupported,
          websocketApiUrl: "wss://test",
          version: 2,
        },
      ],
    });
  });

  it("should give us the websocket API URL", async () => {
    const controller = await createController(options);
    jest.spyOn(controller, "getConfiguration");
    await controller.storeConfiguration();

    expect(controller.getConfiguration).toHaveBeenCalled();

    expect(controller.getWebsocketApiUrl()).toEqual(v2custodian.websocketApiUrl);
  });
});
