import { toChecksumAddress } from "@ethereumjs/util";

import {
  getConfiguredCustodians,
  getCustodianIconForAddress,
  getCustodyAccountDetails,
  getCustodyAccountSupportedChains,
  getMmiPortfolioEnabled,
  getMmiPortfolioUrl,
  getTransactionStatusMap,
  getWaitForConfirmDeepLinkDialog,
} from "./ExtensionSelectors";

describe("selectors", () => {
  const state = {
    metamask: {
      waitForConfirmDeepLinkDialog: "123",
      custodyStatusMaps: "123",
      custodyAccountDetails: {
        "0x5Ab19e7091dD208F352F8E727B6DCC6F8aBB6275": {
          custodianName: "jupiter",
        },
      },
      custodianSupportedChains: {
        "0x5ab19e7091dd208f352f8e727b6dcc6f8abb6275": {
          supportedChains: ["1", "2"],
          custodianName: "jupiter",
        },
      },
      mmiConfiguration: {
        portfolio: {
          enabled: true,
          url: "https://portfolio.io",
        },
        custodians: [
          {
            type: "Jupiter",
            name: "jupiter",
            apiUrl: "https://jupiter-custody.codefi.network",
            iconUrl: "images/jupiter.svg",
            displayName: "Jupiter Custody",
            production: true,
            refreshTokenUrl: null,
            isNoteToTraderSupported: false,
            version: 1,
          },
        ],
      },
    },
  };

  describe("getWaitForConfirmDeepLinkDialog", () => {
    it("extracts a state property", () => {
      const result = getWaitForConfirmDeepLinkDialog(state);
      expect(result).toEqual(state.metamask.waitForConfirmDeepLinkDialog);
    });
  });

  describe("getCustodyAccountDetails", () => {
    it("extracts a state property", () => {
      const result = getCustodyAccountDetails(state);
      expect(result).toEqual(state.metamask.custodyAccountDetails);
    });
  });

  describe("getTransactionStatusMap", () => {
    it("extracts a state property", () => {
      const result = getTransactionStatusMap(state);
      expect(result).toEqual(state.metamask.custodyStatusMaps);
    });
  });

  describe("getCustodianSupportedChains", () => {
    it("extracts a state property", () => {
      const result = getCustodyAccountSupportedChains(state, "0x5ab19e7091dd208f352f8e727b6dcc6f8abb6275");
      expect(result).toEqual(
        state.metamask.custodianSupportedChains[toChecksumAddress("0x5ab19e7091dd208f352f8e727b6dcc6f8abb6275")],
      );
    });
  });

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

  describe("getConfiguredCustodians", () => {
    it("extracts a state property", () => {
      const result = getConfiguredCustodians(state);
      expect(result).toEqual(state.metamask.mmiConfiguration.custodians);
    });
  });

  describe("getCustodianIconForAddress", () => {
    it("extracts a state property", () => {
      const result = getCustodianIconForAddress(state, "0x5ab19e7091dd208f352f8e727b6dcc6f8abb6275");

      expect(result).toEqual(state.metamask.mmiConfiguration.custodians[0].iconUrl);
    });
  });
});
