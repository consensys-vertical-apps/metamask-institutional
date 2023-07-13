import { CustodyController } from "@metamask-institutional/custody-controller";
import { JupiterCustodyKeyring } from "@metamask-institutional/custody-keyring";
import { TransactionUpdateController } from "@metamask-institutional/transaction-update";
import { ICustodianUpdate, ITransactionDetails, MetaMaskTransactionStatuses } from "@metamask-institutional/types";
import createMockInstance from "jest-create-mock-instance";
import fetchMock from "jest-fetch-mock";

import {
  custodianEventHandlerFactory,
  getTxByCustodyId,
  setDashboardCookie,
  showCustodianDeepLink,
  updateCustodianTransactions,
} from "./ExtensionUtils";

fetchMock.enableMocks();

describe("ExtensionUtils", () => {
  const custodyController = new CustodyController();
  const keyring = new JupiterCustodyKeyring();
  const transactionUpdateController = createMockInstance(TransactionUpdateController);

  const getStateMock = { fn: jest.fn() };
  jest.spyOn(getStateMock, "fn");
  jest.spyOn(custodyController, "storeCustodyStatusMap");
  const params = {
    getState: getStateMock.fn,
    log: { info: jest.fn() },
    addKeyringIfNotExists: () => keyring,
    getPendingNonce: jest.fn(() => Promise.resolve(2)),
    setTxHash: jest.fn(),
    signatureController: {
      messages: {
        0: {
          metadata: {
            custodian_transactionId: "0x1",
          },
        },
      },
      setMessageStatusSigned: jest.fn(),
      cancelAbstractMessage: jest.fn(),
    },
    txStateManager: {
      getTransactions: jest.fn(() => [
        {
          txId: "txId",
          custodyId: "custodyId",
          custodyStatus: "status",
          txParams: { from: "from" },
        },
      ]),
      setTxStatusSigned: jest.fn(),
      setTxStatusSubmitted: jest.fn(),
      setTxStatusConfirmed: jest.fn(),
      updateTransaction: jest.fn(),
    },
    TRANSACTION_STATUSES: {
      CONFIRMED: "finished",
    } as unknown as MetaMaskTransactionStatuses,
    custodyController,
    trackTransactionEvent: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
  });

  describe("#updateCustodianTransactions", () => {
    it("will run update function", async () => {
      keyring.getStatusMap = jest.fn(() => ({
        status: {
          mmStatus: "finished",
          finished: false,
          shortText: "fin",
          longText: "fininininished",
        },
      }));
      keyring.getTransaction = jest.fn(() => Promise.resolve({} as ITransactionDetails));

      custodyController.getCustodyTypeByAddress = jest.fn(() => "Custody - Jupiter");

      const updateTxMock = { fn: jest.fn(() => true) };
      jest.spyOn(updateTxMock, "fn");

      const getPendingNonce = jest.fn(() => Promise.resolve(2));

      const setTxHash = jest.fn();

      await updateCustodianTransactions({
        keyring,
        custodyController,
        type: "Custody - Jupiter",
        txList: [
          {
            txId: "txId",
            custodyId: "custodyId",
            custodyStatus: "status",
            txParams: { from: "from" },
          },
        ],
        txStateManager: params.txStateManager,
        getPendingNonce,
        setTxHash,
        transactionUpdateController,
      });

      expect(params.txStateManager.updateTransaction).toBeCalled();
    });
  });

  describe("#custodianEventHandlerFactory", () => {
    it("immediately returns the state when there is no custodyType", async () => {
      keyring.getStatusMap = jest.fn(() => ({
        status: {
          mmStatus: "finished",
          finished: false,
          shortText: "fin",
          longText: "fininininished",
        },
      }));

      custodyController.getCustodyTypeByAddress = jest.fn(() => null);

      const eventHandler = custodianEventHandlerFactory(params);

      const event: Partial<ICustodianUpdate> = {};
      await eventHandler(event as ICustodianUpdate);

      expect(params.getState).toHaveBeenCalled();
    });

    it("can handle personal_sign messages", async () => {
      keyring.getStatusMap = jest.fn(() => ({
        status: {
          mmStatus: "finished",
          finished: false,
          shortText: "fin",
          longText: "fininininished",
        },
      }));

      custodyController.getCustodyTypeByAddress = jest.fn(() => "Custody - Jupiter");

      const eventHandler = custodianEventHandlerFactory(params);

      const event: Partial<ICustodianUpdate> = {
        signedMessage: {
          id: "0x1", // This must match the signature ID from the custodian_sign or custodian_signTypeData method
          address: "0x1", // Hexlified
          signatureVersion: "personal",
          signature: "jfndiwkdk",
          status: {
            finished: true,
            signed: true,
            success: true,
            displayText: "signed",
            reason: "", // The reason for the transaction status
          },
        },
      };

      await eventHandler(event as ICustodianUpdate);

      expect(params.signatureController.messages).toStrictEqual({
        0: {
          metadata: {
            custodian_transactionId: "0x1",
          },
        },
      });
      expect(params.signatureController.setMessageStatusSigned).toHaveBeenCalled();
    });

    it("can handle a personal_sign rejected message", async () => {
      keyring.getStatusMap = jest.fn(() => ({
        status: {
          mmStatus: "rejected",
          finished: false,
          shortText: "fin",
          longText: "fininininished",
        },
      }));

      custodyController.getCustodyTypeByAddress = jest.fn(() => "Custody - Jupiter");

      const eventHandler = custodianEventHandlerFactory(params);

      const event = {
        signature: {
          custodian_transactionId: "",
          id: "123",
          transactionStatus: "status",
          createdTimestamp: null,
          signedTimestamp: null,
          abortedTimestamp: null,
          failedTimestamp: null,
          failureReason: null,
          network: null,
          signed_content: "0xdeadbeef",
          buffer_type: "personal",
          from: "0x1",
        },
      };

      await eventHandler(event as unknown as ICustodianUpdate);

      expect(params.signatureController.setMessageStatusSigned).toHaveBeenCalledTimes(0);
    });

    it("can handle a sign message that failed", async () => {
      keyring.getStatusMap = jest.fn(() => ({
        status: {
          mmStatus: "failed",
          finished: false,
          shortText: "fin",
          longText: "fininininished",
        },
      }));

      custodyController.getCustodyTypeByAddress = jest.fn(() => "Custody - Jupiter");

      const eventHandler = custodianEventHandlerFactory(params);

      const event = {
        signature: {
          custodian_transactionId: "",
          id: "123",
          transactionStatus: "status",
          createdTimestamp: null,
          signedTimestamp: null,
          abortedTimestamp: null,
          failedTimestamp: null,
          failureReason: null,
          network: null,
          signed_content: "0xdeadbeef",
          buffer_type: "",
          from: "0x1",
        },
      };

      await eventHandler(event as unknown as ICustodianUpdate);

      expect(params.signatureController.setMessageStatusSigned).toHaveBeenCalledTimes(0);
    });

    it("will process an update", async () => {
      keyring.getStatusMap = jest.fn(() => ({
        status: {
          mmStatus: "confirmed",
          finished: false,
          shortText: "fin",
          longText: "fininininished",
        },
      }));

      custodyController.getCustodyTypeByAddress = jest.fn(() => "Custody - Jupiter");

      const params = {
        getState: getStateMock.fn,
        log: { info: jest.fn() },
        addKeyringIfNotExists: () => keyring,
        getPendingNonce: jest.fn(() => Promise.resolve(2)),
        setTxHash: jest.fn(),
        signatureController: {
          messages: {},
          setMessageStatusSigned: jest.fn(),
          cancelAbstractMessage: jest.fn(),
        },
        txStateManager: {
          getTransactions: jest.fn(() => [
            {
              txId: "txId",
              custodyId: "custodyId",
              custodyStatus: "status",
              txParams: { from: "from" },
              status: "confirmed",
            },
          ]),
          setTxStatusSigned: jest.fn().mockImplementation(() => console.log("===setTxStatusSigned")),
          setTxStatusSubmitted: jest.fn().mockImplementation(() => console.log("===setTxStatusSubmitted")),
          setTxStatusConfirmed: jest.fn().mockImplementation(() => console.log("===setTxStatusConfirmed")),
          updateTransaction: jest.fn().mockImplementation(() => console.log("===updateTransaction")),
        },
        TRANSACTION_STATUSES: {
          CONFIRMED: "finished",
        } as unknown as MetaMaskTransactionStatuses,
        custodyController,
        trackTransactionEvent: jest.fn(),
      };
      await custodianEventHandlerFactory(params)({
        transaction: {
          from: "from",
          id: "id",
          status: {
            displayText: "status",
          },
          hash: "hash",
          nonce: "0x2",
        },
      } as unknown as ICustodianUpdate);
      await custodianEventHandlerFactory(params)({
        transaction: {
          from: "from",
          id: "id",
          status: {
            displayText: "status",
          },
          hash: "hash",
          nonce: "0x2",
        },
        signature: {
          id: "id",
          address: "from",
          signatureVersion: "",
          signature: "",
          status: {
            displayText: "status",
          },
        },
      } as unknown as ICustodianUpdate);
    });

    it("will process an update with a failed tx", async () => {
      keyring.getStatusMap = jest.fn(() => ({
        status: {
          mmStatus: "failed",
          finished: false,
          shortText: "fin",
          longText: "fininininished",
        },
      }));

      custodyController.getCustodyTypeByAddress = jest.fn(() => "Custody - Jupiter");

      const params = {
        getState: getStateMock.fn,
        log: { info: jest.fn() },
        addKeyringIfNotExists: () => keyring,
        getPendingNonce: jest.fn(() => Promise.resolve(2)),
        setTxHash: jest.fn(),
        signatureController: {
          messages: {},
          setMessageStatusSigned: jest.fn(),
          cancelAbstractMessage: jest.fn(),
        },
        txStateManager: {
          getTransactions: jest.fn(() => [
            {
              txId: "txId",
              custodyId: "custodyId",
              custodyStatus: "status",
              txParams: { from: "from" },
              status: "confirmed",
            },
          ]),
          setTxStatusFailed: jest.fn(),
          setTxStatusSigned: jest.fn(),
          setTxStatusSubmitted: jest.fn(),
          setTxStatusConfirmed: jest.fn(),
          updateTransaction: jest.fn(),
        },
        TRANSACTION_STATUSES: {
          CONFIRMED: "finished",
        } as unknown as MetaMaskTransactionStatuses,
        custodyController,
        trackTransactionEvent: jest.fn(),
      };
      await custodianEventHandlerFactory(params)({
        transaction: {
          from: "from",
          id: "id",
          status: {
            displayText: "failed",
          },
          hash: "hash",
          nonce: "0x2",
        },
      } as unknown as ICustodianUpdate);
    });

    it("will process an update with a confirmed tx", async () => {
      keyring.getStatusMap = jest.fn(() => ({
        status: {
          mmStatus: "confirmed",
          finished: false,
          shortText: "fin",
          longText: "fininininished",
        },
      }));

      custodyController.getCustodyTypeByAddress = jest.fn(() => "Custody - Jupiter");

      const params = {
        getState: getStateMock.fn,
        log: { info: jest.fn() },
        addKeyringIfNotExists: () => keyring,
        getPendingNonce: jest.fn(() => Promise.resolve(2)),
        setTxHash: jest.fn(),
        signatureController: {
          messages: {},
          setMessageStatusSigned: jest.fn(),
          cancelAbstractMessage: jest.fn(),
        },
        txStateManager: {
          getTransactions: jest.fn(() => [
            {
              txId: "txId",
              custodyId: "custodyId",
              custodyStatus: "status",
              txParams: { from: "from" },
              status: "unapproved",
            },
          ]),
          setTxStatusFailed: jest.fn(),
          setTxStatusSigned: jest.fn(),
          setTxStatusSubmitted: jest.fn(),
          setTxStatusConfirmed: jest.fn(),
          updateTransaction: jest.fn(),
        },
        TRANSACTION_STATUSES: {
          CONFIRMED: "finished",
        } as unknown as MetaMaskTransactionStatuses,
        custodyController,
        trackTransactionEvent: jest.fn(),
      };
      await custodianEventHandlerFactory(params)({
        transaction: {
          from: "from",
          id: "id",
          status: {
            displayText: "confirmed",
          },
          hash: "hash",
          nonce: "0x2",
        },
      } as unknown as ICustodianUpdate);
    });

    it("will process an update with a signed tx", async () => {
      const keyring = new JupiterCustodyKeyring();
      keyring.getStatusMap = jest.fn(() => ({
        status: {
          mmStatus: "signed",
          finished: false,
          shortText: "fin",
          longText: "fininininished",
        },
      }));
      const custodyController = new CustodyController();

      custodyController.getCustodyTypeByAddress = jest.fn(() => "Custody - Jupiter");

      const params = {
        getState: getStateMock.fn,
        log: { info: jest.fn() },
        addKeyringIfNotExists: () => keyring,
        getPendingNonce: jest.fn(() => Promise.resolve(2)),
        setTxHash: jest.fn(),
        signatureController: {
          messages: {},
          setMessageStatusSigned: jest.fn(),
          cancelAbstractMessage: jest.fn(),
        },
        txStateManager: {
          getTransactions: jest.fn(() => [
            {
              txId: "txId",
              custodyId: "custodyId",
              custodyStatus: "status",
              txParams: { from: "from" },
              status: "unapproved",
            },
          ]),
          setTxStatusFailed: jest.fn(),
          setTxStatusSigned: jest.fn(),
          setTxStatusSubmitted: jest.fn(),
          setTxStatusConfirmed: jest.fn(),
          updateTransaction: jest.fn(),
        },
        TRANSACTION_STATUSES: {
          CONFIRMED: "finished",
        } as unknown as MetaMaskTransactionStatuses,
        custodyController,
        trackTransactionEvent: jest.fn(),
      };
      await custodianEventHandlerFactory(params)({
        transaction: {
          from: "from",
          id: "id",
          status: {
            displayText: "signed",
          },
          hash: "hash",
          nonce: "0x2",
        },
      } as unknown as ICustodianUpdate);
    });
  });

  describe("#showCustodianDeepLink", () => {
    it("will run getCustodianConfirmDeepLink and onDeepLinkShown", async () => {
      const params = {
        dispatch: jest.fn(() => ({ deepLink: "link", custodyId: "custodyId" })),
        mmiActions: {
          getCustodianSignMessageDeepLink: jest.fn(),
          getCustodianConfirmDeepLink: jest.fn(),
          setWaitForConfirmDeepLinkDialog: jest.fn(),
        },
        txId: "txId",
        fromAddress: "0xAddress",
        closeNotification: true,
        isSignature: false,
        custodyId: undefined,
        onDeepLinkFetched: jest.fn(),
        onDeepLinkShown: jest.fn(),
        showCustodyConfirmLink: jest.fn(),
      };
      await showCustodianDeepLink(params);
      expect(params.mmiActions.getCustodianConfirmDeepLink).toBeCalled();
      expect(params.onDeepLinkShown).toBeCalled();
    });
    it("will run getCustodianSignMessageDeepLink and onDeepLinkShown", async () => {
      const params = {
        dispatch: jest.fn(() => ({ deepLink: "link", custodyId: "custodyId" })),
        mmiActions: {
          getCustodianSignMessageDeepLink: jest.fn(),
          getCustodianConfirmDeepLink: jest.fn(),
          setWaitForConfirmDeepLinkDialog: jest.fn(),
        },
        txId: undefined,
        fromAddress: "0xAddress",
        closeNotification: true,
        isSignature: true,
        custodyId: "custodyId",
        onDeepLinkFetched: jest.fn(),
        onDeepLinkShown: jest.fn(),
        showCustodyConfirmLink: jest.fn(),
      };
      await showCustodianDeepLink(params);
      expect(params.mmiActions.getCustodianSignMessageDeepLink).toBeCalled();
      expect(params.onDeepLinkShown).toBeCalled();
    });
  });

  describe("#setDashboardCookie", () => {
    it("should call dev set cookie endpoint", async () => {
      const testData = {
        accounts: [{ address: "test", name: "test", custodyType: null }],
        networks: [1],
        metrics: {
          metaMetricsId: "mmId",
          extensionId: "extId",
        },
      };

      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 200,
          },
        };
      });
      await setDashboardCookie(testData, ["test"]);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("returns false if it fails", async () => {
      const testData = {
        accounts: [{ address: "test", name: "test", custodyType: null }],
        networks: [1],
        metrics: {
          metaMetricsId: "mmId",
          extensionId: "extId",
        },
      };
      fetchMock.mockRejectedValueOnce(new Error("test"));
      const result = await setDashboardCookie(testData, ["test"]);

      expect(result).toBeFalsy();
    });
  });

  it("should call getTxByCustodyId", async () => {
    const getTransactions = () => [];

    const txCustodyId = "";

    const txByCustodyId = getTxByCustodyId(getTransactions, txCustodyId);
    expect(txByCustodyId).toEqual(undefined);
  });
});
