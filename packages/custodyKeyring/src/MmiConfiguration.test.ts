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
  environments: [],
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
  environments: [],
};

const v2custodian = {
  type: "JSONRPC",
  iconUrl: "https://saturn-custody-ui.dev.metamask-institutional.io/saturn.svg",
  name: "Saturn Custody",
  website: "https://saturn-custody-ui.dev.metamask-institutional.io/",
  envName: "saturn-dev",
  apiUrl: "https://saturn-custody.dev.metamask-institutional.io/eth",
  displayName: "Saturn Custody",
  production: true,
  refreshTokenUrl: "https://saturn-custody.dev.metamask-institutional.io/oauth/token",
  websocketApiUrl: "wss://websocket.dev.metamask-institutional.io/v1/ws",
  isNoteToTraderSupported: true,
  version: 2,
  headquarters: "UK",
  tokens: "All ERC-20 tokens",
  chains: ["Ethereum"],
  tags: null,
  environments: [
    {
      refreshTokenUrl: "https://saturn-custody.dev.metamask-institutional.io/oauth/token",
      name: "saturn-dev",
      displayName: "Saturn Custody",
      enabled: true,
      websocketApiUrl: "wss://websocket.dev.metamask-institutional.io/v1/ws",
      apiBaseUrl: "https://saturn-custody.dev.metamask-institutional.io/eth",
      iconUrl: "https://saturn-custody-ui.dev.metamask-institutional.io/saturn.svg",
      isNoteToTraderSupported: true,
    },
  ],
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
            website: null,
            envName: null,
            displayName: custodian.displayName,
            production: custodian.production,
            refreshTokenUrl: null,
            websocketApiUrl: null,
            isNoteToTraderSupported: false,
            version: 1,
          })),
        {
          type: "JSONRPC",
          name: v2custodian.name,
          apiUrl: v2custodian.environments[0].apiBaseUrl,
          iconUrl: v2custodian.iconUrl,
          website: v2custodian.website,
          envName: v2custodian.envName,
          displayName: v2custodian.displayName,
          production: v2custodian.production,
          refreshTokenUrl: v2custodian.refreshTokenUrl,
          isNoteToTraderSupported: v2custodian.environments[0].isNoteToTraderSupported,
          websocketApiUrl: "wss://websocket.dev.metamask-institutional.io/v1/ws",
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
