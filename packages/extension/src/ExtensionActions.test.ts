import { mmiActionsFactory } from "./ExtensionActions";

describe("ExtensionActions", () => {
  describe("#mmiActionsFactory", () => {
    it("returns mmiActions object", async () => {
      const actionsMock = {
        connectCustodyAddresses: jest.fn(),
        getCustodianAccounts: jest.fn(),
        getCustodianAccountsByAddress: jest.fn(),
        getCustodianTransactionDeepLink: jest.fn(),
        getCustodianConfirmDeepLink: jest.fn(),
        getCustodianSignMessageDeepLink: jest.fn(),
        getCustodianToken: jest.fn(),
        getCustodianJWTList: jest.fn(),
        removeAddTokenConnectRequest: jest.fn(),
        setCustodianConnectRequest: jest.fn(),
        getCustodianConnectRequest: jest.fn(),
        getMmiConfiguration: jest.fn(),
        getAllCustodianAccountsWithToken: jest.fn(),
        showCustodyConfirmLink: jest.fn(),
        setWaitForConfirmDeepLinkDialog: jest.fn(),
        setCustodianNewRefreshToken: jest.fn(),
        showInteractiveReplacementTokenModal: jest.fn(),
      };
      const mmiActions = mmiActionsFactory({
        log: { debug: jest.fn(), error: jest.fn() },
        showLoadingIndication: jest.fn(),
        submitRequestToBackground: jest.fn(() => actionsMock),
        displayWarning: jest.fn(),
        hideLoadingIndication: jest.fn(),
        forceUpdateMetamaskState: jest.fn(),
        showModal: jest.fn(),
        callBackgroundMethod: jest.fn(() => actionsMock),
      });

      const connectCustodyAddresses = mmiActions.connectCustodyAddresses({}, "0xAddress");
      mmiActions.getCustodianAccounts("token", "envName", "custody", "getNonImportedAccounts", {});
      mmiActions.getCustodianAccountsByAddress("jwt", "envName", "address", "custody", {}, 4);
      mmiActions.getMmiConfiguration({
        portfolio: {
          enabled: true,
          url: "https://portfolio.io",
        },
        custodians: [],
      });
      mmiActions.getCustodianToken({});
      mmiActions.getCustodianConnectRequest();
      mmiActions.getCustodianTransactionDeepLink("0xAddress", "txId");
      mmiActions.getCustodianConfirmDeepLink("txId");
      mmiActions.getCustodianSignMessageDeepLink("0xAddress", "custodyTxId");
      mmiActions.getCustodianJWTList({});
      mmiActions.getAllCustodianAccountsWithToken({
        custodianType: "custodianType",
        token: "token",
      });
      mmiActions.removeAddTokenConnectRequest({
        origin: "origin",
        environment: "environment",
        token: "token",
      });
      mmiActions.setCustodianConnectRequest({
        token: "token",
        custodianName: "custodianName",
        custodianType: "custodianType",
      });
      mmiActions.showCustodyConfirmLink({
        link: "link",
        closeNotification: false,
        custodyId: "custodyIf",
      })(jest.fn());
      const setWaitForConfirmDeepLinkDialog = mmiActions.setWaitForConfirmDeepLinkDialog(true);
      mmiActions.setCustodianNewRefreshToken("address", "refreshToken");
      mmiActions.showInteractiveReplacementTokenModal()(jest.fn());
      connectCustodyAddresses(jest.fn());
      setWaitForConfirmDeepLinkDialog(jest.fn());
      expect(connectCustodyAddresses).toBeDefined();
      expect(setWaitForConfirmDeepLinkDialog).toBeDefined();
    });
  });
});
