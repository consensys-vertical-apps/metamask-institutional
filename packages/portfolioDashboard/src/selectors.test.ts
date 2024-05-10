import { getMmiPortfolioEnabled, getMmiPortfolioUrl } from "./selectors";

describe("selectors", () => {
  const state = {
    metamask: {
      waitForConfirmDeepLinkDialog: "123",
      custodyStatusMaps: "123",
      custodyAccountDetails: {
        "0x5Ab19e7091dD208F352F8E727B6DCC6F8aBB6275": {
          custodianName: "json-rpc",
        },
      },
      custodianSupportedChains: {
        "0x5ab19e7091dd208f352f8e727b6dcc6f8abb6275": {
          supportedChains: ["1", "2"],
          custodianName: "json-rpc",
        },
      },
      mmiConfiguration: {
        portfolio: {
          enabled: true,
          url: "https://portfolio.io",
        },
        custodians: [
          {
            type: "JSONRPC",
            name: "JSON-RPC",
            apiUrl: "https://saturn-custody.codefi.network",
            iconUrl: "images/saturn.svg",
            displayName: "Saturn Custody",
            production: true,
            refreshTokenUrl: null,
            isNoteToTraderSupported: false,
            version: 1,
          },
        ],
      },
    },
  };
  describe("getMmiPortfolioEnabled", () => {
    it("extracts a state property", () => {
      const result = getMmiPortfolioEnabled(state);
      expect(result).toEqual(state.metamask.mmiConfiguration.portfolio.enabled);
    });
  });
  describe("getMmiPortfolioUrl", () => {
    it("extracts a state property", () => {
      const result = getMmiPortfolioUrl(state);
      expect(result).toEqual(state.metamask.mmiConfiguration.portfolio.url);
    });
  });
});
