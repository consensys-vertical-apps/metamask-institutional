import { ICustodianApi, JsonRpcCustodianApi, mapTransactionStatus } from "@metamask-institutional/sdk";
import { ICustodianUpdate, MetaMaskTransactionStatuses } from "@metamask-institutional/types";
import { WebsocketClientController } from "@metamask-institutional/websocket-client";
import { mocked } from "ts-jest/utils";

import { IWatchedTransaction } from "./interfaces/IWatchedTransaction";
import { TransactionUpdateController } from "./TransactionUpdate";

jest.mock("@metamask-institutional/websocket-client", () => {
  return {
    WebsocketClientController: jest.fn().mockImplementation(() => ({
      requestStreamForCustomerProof: jest.fn(() => Promise.resolve({ streamSubject: "123" })),
      connectWS: jest.fn(),
      sendAcknowledgement: jest.fn(),
    })),
  };
});

jest.mock("@metamask-institutional/sdk");
jest.mock("@metamask-institutional/custody-keyring");
// jest.mock("@metamask-institutional/websocket-client");

jest.mock("./constants", () => ({
  POLL_TRANSACTION_RETRIES: 5,
  TRANSACTION_POLLING_INTERVAL: 1,
}));

describe("TransactionUpdateController", () => {
  let transactionUpdateController: TransactionUpdateController;
  let mockedJsonRpcCustodianApi: ICustodianApi;
  let getCustodyKeyring;
  let getCustomerProof;
  let getStatusMap;
  let mockMmiConfigurationController;

  const mockedWebsocketClientController = mocked(WebsocketClientController, true);
  let mockedWebsocketClientControllerInstance;

  let mockCustodyKeyring;

  let features: { [key: string]: boolean };

  beforeEach(() => {
    jest.clearAllMocks();
    features = {
      websocketApi: true,
    };

    getCustomerProof = jest.fn(() => Promise.resolve("token"));

    mockCustodyKeyring = {
      sdkList: { sdk: mockedJsonRpcCustodianApi },
      getCustomerProof,
      getStatusMap,
      getAccountDetails: jest.fn().mockImplementation(() => ({ authDetails: { refreshToken: "0x123" } })),
    };

    mockMmiConfigurationController = {
      store: {
        getState: jest.fn().mockReturnValue({
          mmiConfiguration: {
            custodians: [
              {
                apiUrl: "https://api",
              },
            ],
            features,
          },
        }),
      },
      configurationClient: {},
      storeConfiguration: jest.fn(),
      getConfiguration: jest.fn(),
      getWebsocketApiUrl: jest.fn(),
    };

    getStatusMap = jest.fn();
    mockedJsonRpcCustodianApi = new JsonRpcCustodianApi(null, null, null, null);
    getCustodyKeyring = jest.fn(() => Promise.resolve(mockCustodyKeyring));

    jest.useFakeTimers();
    jest.spyOn(global, "setInterval");

    transactionUpdateController = new TransactionUpdateController({
      initState: {},
      getCustodyKeyring,
      mmiConfigurationController: mockMmiConfigurationController,
      captureException: jest.fn(),
    });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe("getCustomerProofForAddresses", () => {
    it("should get the authDetails for an address", async () => {
      await transactionUpdateController.attemptWebsocketConnection();

      mockedWebsocketClientControllerInstance = mockedWebsocketClientController.mock.results[0].value;

      await transactionUpdateController.getCustomerProofForAddresses(["0xc0ffee254729296a45a3885639AC7E10F9d54979"]);

      expect(mockCustodyKeyring.getAccountDetails).toHaveBeenCalledWith("0xc0ffee254729296a45a3885639AC7E10F9d54979");

      expect(mockCustodyKeyring.getCustomerProof).toHaveBeenCalledWith("0xc0ffee254729296a45a3885639AC7E10F9d54979");

      expect(mockedWebsocketClientControllerInstance.requestStreamForCustomerProof).toHaveBeenCalledWith("token");
    });

    it("should only call getCustomerProof once if there is no change in the token", async () => {
      await transactionUpdateController.attemptWebsocketConnection();

      mockedWebsocketClientControllerInstance = mockedWebsocketClientController.mock.results[0].value;

      await transactionUpdateController.getCustomerProofForAddresses([
        "0xc0ffee254729296a45a3885639AC7E10F9d54979",
        "0x1",
      ]); //getCustomerProof will return `token`both times

      expect(mockCustodyKeyring.getAccountDetails).toHaveBeenCalledWith("0xc0ffee254729296a45a3885639AC7E10F9d54979");

      expect(mockCustodyKeyring.getCustomerProof).toHaveBeenCalledTimes(1);
    });

    it("will enable polling for an address if it fails to get CP", async () => {
      await transactionUpdateController.attemptWebsocketConnection();

      mockedWebsocketClientControllerInstance = mockedWebsocketClientController.mock.results[0].value;

      mockCustodyKeyring.getCustomerProof.mockImplementationOnce(() =>
        Promise.reject(new Error("Something went wrong")),
      );

      await transactionUpdateController.getCustomerProofForAddresses(["0xc0ffee254729296a45a3885639AC7E10F9d54979"]);

      expect(transactionUpdateController.pollAddresses).toEqual(["0xc0ffee254729296a45a3885639AC7E10F9d54979"]);

      jest.spyOn(transactionUpdateController, "captureException");

      expect(transactionUpdateController.captureException).toHaveBeenCalledWith(new Error("Something went wrong"));
    });

    it("will not capture an exception if the rejection is Method Not Found", async () => {
      await transactionUpdateController.attemptWebsocketConnection();

      mockedWebsocketClientControllerInstance = mockedWebsocketClientController.mock.results[0].value;

      mockCustodyKeyring.getCustomerProof.mockImplementationOnce(() => Promise.reject(new Error("Method not found")));

      await transactionUpdateController.getCustomerProofForAddresses(["0xc0ffee254729296a45a3885639AC7E10F9d54979"]);

      expect(transactionUpdateController.pollAddresses).toEqual(["0xc0ffee254729296a45a3885639AC7E10F9d54979"]);

      jest.spyOn(transactionUpdateController, "captureException");

      expect(transactionUpdateController.captureException).not.toHaveBeenCalled();
    });

    it("will do nothing if there is no address", async () => {
      await transactionUpdateController.attemptWebsocketConnection();

      mockedWebsocketClientControllerInstance = mockedWebsocketClientController.mock.results[0].value;

      mockCustodyKeyring.getCustomerProof.mockImplementationOnce(() => Promise.reject(new Error("Method not found")));

      await transactionUpdateController.getCustomerProofForAddresses([]);
      expect(mockCustodyKeyring.getAccountDetails).not.toHaveBeenCalled();
    });

    it("will poll for an address if the CP is not verified", async () => {
      await transactionUpdateController.attemptWebsocketConnection();

      mockedWebsocketClientControllerInstance = mockedWebsocketClientController.mock.results[0].value;

      mockedWebsocketClientControllerInstance.requestStreamForCustomerProof.mockRejectedValueOnce(new Error("no"));

      await transactionUpdateController.getCustomerProofForAddresses(["0xc0ffee254729296a45a3885639AC7E10F9d54979"]);

      expect(transactionUpdateController.pollAddresses).toEqual(["0xc0ffee254729296a45a3885639AC7E10F9d54979"]);
    });
  });

  describe("attemptWebsocketConnection", () => {
    it("should not fall back to polling if getting a customer proof fails a different error", async () => {
      mockedJsonRpcCustodianApi.getCustomerProof = jest.fn().mockRejectedValue(new Error("Something else"));

      const mockThis = {
        startPolling: jest.fn(),
        custodianApi: mockedJsonRpcCustodianApi,
      };

      await expect(transactionUpdateController.attemptWebsocketConnection.bind(mockThis)).rejects.toThrowError;
    });

    it("should have isWSConnectionOpen as false if connection is not open", async () => {
      const mockThis = {
        startPolling: jest.fn(),
        custodianApi: mockedJsonRpcCustodianApi,
        tearDown: jest.fn(),
        handleUpdateEvent: jest.fn(),
        mmiConfigurationController: mockMmiConfigurationController,
        captureException: jest.fn().mockImplementation(e => console.log(e)),
        isWSConnectionOpen: false,
        websocketClient: {
          connectWS: jest.fn(),
        },
        getCustomerProofForAddresses: jest.fn(),
      };

      await transactionUpdateController.attemptWebsocketConnection.bind(mockThis)();

      expect(mockThis.isWSConnectionOpen).toBe(false);
    });

    it("should fallback to polling when call for WebsocketClientController fails", async () => {
      const mockThis = {
        startPolling: jest.fn(),
        custodianApi: mockedJsonRpcCustodianApi,
        tearDown: jest.fn(),
        websocketClient: {
          connectWS: jest.fn(),
        },
        isWSConnectionOpen: false,
        mmiConfigurationController: mockMmiConfigurationController,
        captureException: jest.fn(),
      };

      await transactionUpdateController.attemptWebsocketConnection.bind(mockThis)();

      expect(mockThis.startPolling).toHaveBeenCalled();
    });
  });

  describe("subscribeToEvents", () => {
    it("should fallback to polling if WS are not activated", async () => {
      features.websocketApi = false;

      const mockThis = {
        startPolling: jest.fn(),
        mmiConfigurationController: mockMmiConfigurationController,
      };

      await transactionUpdateController.subscribeToEvents.bind(mockThis)();

      expect(mockThis.startPolling).toHaveBeenCalled();
    });
  });

  describe("addTransactionToWatchList", () => {
    it("should add a transaction to the watch list", async () => {
      const address = "0xc0ffee254729296a45a3885639AC7E10F9d54979".toLocaleLowerCase();
      await transactionUpdateController.addTransactionToWatchList("123", address);

      expect(transactionUpdateController.watchedTransactions).toEqual([
        {
          custodianTransactionId: "123",
          complete: false,
          failed: false,
          attempts: 0,
          isSignedMessage: false,
          bufferType: "",
          from: "0xc0ffee254729296a45a3885639AC7E10F9d54979",
        },
      ]);
    });
  });

  describe("pollForAddress", () => {
    it("should add a transaction to the watch list", async () => {
      const address = "0xc0ffee254729296a45a3885639AC7E10F9d54979".toLocaleLowerCase();

      transactionUpdateController.pollForAddress(address);

      expect(transactionUpdateController.pollAddresses).toContain("0xc0ffee254729296a45a3885639AC7E10F9d54979");
    });
  });

  describe("startPolling", () => {
    it("should set the polling variable", async () => {
      transactionUpdateController.startPolling();

      expect(transactionUpdateController.pollForEveryAddress).toBe(true);
    });
  });

  describe("pollingTask", () => {
    it("does nothing if polling is false", async () => {
      const mockThis = {
        polling: false,
        watchedTransactions: [],
        pollForTransaction: jest.fn(),
      };

      await transactionUpdateController.pollingTask.bind(mockThis)();

      expect(mockThis.pollForTransaction).toHaveBeenCalledTimes(0);
    });

    it("should loop through the watch list and call pollForTransaction on transactions that are not complete or failed", async () => {
      const watchedTransactions: IWatchedTransaction[] = [
        {
          custodianTransactionId: "123",
          complete: false,
          failed: false,
          attempts: 0,
        },
        {
          custodianTransactionId: "456",
          complete: false,
          failed: true,
          attempts: 5,
        },
        {
          custodianTransactionId: "789",
          complete: true,
          failed: false,
          attempts: 0,
        },
      ];

      const mockThis = {
        pollForEveryAddress: true,
        pollAddresses: [],
        watchedTransactions,
        pollForTransaction: jest.fn(),
      };

      await transactionUpdateController.pollingTask.bind(mockThis)();

      expect(mockThis.pollForTransaction).toHaveBeenCalledTimes(1);
    });
    it("should increment the attempts for any transactions that fail to be polled", async () => {
      const watchedTransactions: IWatchedTransaction[] = [
        {
          custodianTransactionId: "hey",
          complete: false,
          failed: false,
          attempts: 0,
        },
      ];

      const mockThis = {
        pollForEveryAddress: true,
        pollAddresses: [],
        watchedTransactions,
        pollForTransaction: jest.fn().mockRejectedValue(new Error("error")),
        captureException: jest.fn(),
      };

      await transactionUpdateController.pollingTask.bind(mockThis)();

      expect(mockThis.watchedTransactions[0].attempts).toEqual(1);
    });

    it("should mark a transaction as failed if it exceeds the allowed attempts", async () => {
      const watchedTransactions: IWatchedTransaction[] = [
        {
          custodianTransactionId: "hey",
          complete: false,
          failed: false,
          attempts: 5,
        },
      ];

      const mockThis = {
        pollForEveryAddress: true,
        pollAddresses: [],
        watchedTransactions,
        pollForTransaction: jest.fn().mockRejectedValue(new Error("error")),
        captureException: jest.fn(),
      };

      await transactionUpdateController.pollingTask.bind(mockThis)();

      expect(mockThis.watchedTransactions[0].attempts).toEqual(6);
      expect(mockThis.watchedTransactions[0].failed).toEqual(true);
    });
  });

  describe("pollForTransaction", () => {
    const signedStatus = {
      signed: {
        mmStatus: MetaMaskTransactionStatuses.SIGNED,
        shortText: "Signed",
        longText: "Signed",
        finished: false,
      },
    };

    const getSignedMessageResponse = {
      custodian_transactionId: "123",
      status: {
        finished: true,
        signed: true,
        success: true,
        displayText: "signed",
      },
      signature: "some content",
    };

    const getTransactionResponse = {
      custodian_transactionId: "123",
      transactionHash: "hash",
      transactionStatus: "mined",
      reason: "reason",
      from: "from",
      gasPrice: "gasPrice",
      nonce: "nonce",
      to: "to",
      value: "value",
      data: "data",
      gasLimit: "gasLimit",
      status: "",
    };

    it("calls getTransaction on the custodian API and maps it to the transaction update format", async () => {
      const watchedTransaction: IWatchedTransaction = {
        custodianTransactionId: "123",
        complete: false,
        failed: false,
        attempts: 0,
      };

      const mockThis = {
        handleUpdateEvent: jest.fn(),
        custodianApi: mockedJsonRpcCustodianApi,
        getCustodyKeyring: jest.fn(() =>
          Promise.resolve({
            sdkList: [
              {
                sdk: { custodianApi: mockedJsonRpcCustodianApi },
              },
            ],
            getCustomerProof,
            getStatusMap: jest.fn(() => signedStatus),
            getSignature: jest.fn(),
            getTransaction: jest.fn(() => getTransactionResponse),
          }),
        ),
      };

      mockedJsonRpcCustodianApi.getTransaction = jest.fn().mockResolvedValue({
        getTransactionResponse,
      });

      await transactionUpdateController.pollForTransaction.bind(mockThis)(watchedTransaction);

      expect(mockThis.handleUpdateEvent).toHaveBeenCalledWith({
        transaction: {
          id: getTransactionResponse.custodian_transactionId,
          hash: getTransactionResponse.transactionHash,
          status: mapTransactionStatus(getTransactionResponse.transactionStatus),
          from: getTransactionResponse.from,
          gasPrice: getTransactionResponse.gasPrice,
          nonce: getTransactionResponse.nonce,
          to: getTransactionResponse.to,
          value: getTransactionResponse.value,
          data: getTransactionResponse.data,
          gas: getTransactionResponse.gasLimit,
          type: null,
        },
      });
    });

    it("should clean from watchedTransactions[] a Tx that has status: finished", async () => {
      const watchedTransactions: IWatchedTransaction[] = [
        {
          custodianTransactionId: "123",
          complete: false,
          failed: false,
          attempts: 0,
          isSignedMessage: true,
          bufferType: "",
          from: "",
        },
      ];

      const eventData: ICustodianUpdate = {
        signedMessage: {
          id: "123",
          address: "0x1",
          signatureVersion: "personal",
          signature: "0xdeadbeef",
          status: {
            finished: true,
            signed: true,
            success: true,
            displayText: "signed",
            reason: "",
          },
        },
        metadata: {
          traceId: "0x1",
          userId: "0x1",
          customerId: "0x1",
          customerName: "0x1",
        },
      };

      const mockThis = {
        watchedTransactions,
        eventCallbacks: [],
        emit: jest.fn(),
      };

      await transactionUpdateController.handleUpdateEvent.bind(mockThis)(eventData);

      expect(watchedTransactions).toEqual([]);
    });

    it("calls getSignedMessage on the custodian API and maps it to the signature update format", async () => {
      const watchedTransaction: IWatchedTransaction = {
        custodianTransactionId: "123",
        complete: false,
        failed: false,
        attempts: 0,
        isSignedMessage: true,
        bufferType: "",
        from: "",
      };

      const mockThis = {
        handleUpdateEvent: jest.fn(),
        custodianApi: mockedJsonRpcCustodianApi,
        getCustodyKeyring: jest.fn(() =>
          Promise.resolve({
            sdkList: [
              {
                sdk: { custodianApi: mockedJsonRpcCustodianApi },
              },
            ],
            getCustomerProof,
            getStatusMap: jest.fn(() => signedStatus),
            getSignature: jest.fn(() => getSignedMessageResponse),
            getTransaction: jest.fn(),
          }),
        ),
      };

      mockedJsonRpcCustodianApi.getSignedMessage = jest.fn().mockResolvedValue({
        getSignedMessageResponse,
      });

      await transactionUpdateController.pollForTransaction.bind(mockThis)(watchedTransaction);

      expect(mockThis.handleUpdateEvent).toHaveBeenCalledWith({
        signedMessage: {
          id: watchedTransaction.custodianTransactionId,
          address: watchedTransaction.from,
          signatureVersion: watchedTransaction.bufferType,
          signature: getSignedMessageResponse.signature,
          status: getSignedMessageResponse.status,
        },
      });
    });

    it("returns early if the custodykeyring is not found", async () => {
      const watchedTransaction: IWatchedTransaction = {
        custodianTransactionId: "123",
        complete: false,
        failed: false,
        attempts: 0,
        isSignedMessage: true,
        bufferType: "",
        from: "",
      };

      const mockThis = {
        handleUpdateEvent: jest.fn(),
        custodianApi: mockedJsonRpcCustodianApi,
        getCustodyKeyring: jest.fn(() => Promise.resolve(null)),
      };

      mockedJsonRpcCustodianApi.getSignedMessage = jest.fn().mockResolvedValue({
        getSignedMessageResponse,
      });

      await transactionUpdateController.pollForTransaction.bind(mockThis)(watchedTransaction);

      expect(mockThis.handleUpdateEvent).not.toHaveBeenCalled();
    });
  });

  describe("handleWebsocketEvent", () => {
    it("should trigger an acknowledgement", async () => {
      const data: ICustodianUpdate = {
        signedMessage: {
          id: "0x1",
          address: "0x1",
          signatureVersion: "personal",
          signature: "0xdeadbeef",
          status: {
            finished: true,
            signed: true,
            success: true,
            displayText: "signed",
            reason: "",
          },
        },
        metadata: {
          traceId: "0x1",
          userId: "0x1",
          customerId: "0x1",
          customerName: "0x1",
        },
      };

      transactionUpdateController.attemptWebsocketConnection();
      transactionUpdateController.handleWebsocketEvent(data);

      expect(transactionUpdateController.websocketClient.sendAcknowledgement).toHaveBeenCalledWith(
        data.metadata.traceId,
      );
    });
  });

  describe("prepareEventListener", () => {
    it("sets up a timer, calls the event handler factory and sets up two event listeners on the transaction update event and the signature update event", () => {
      const mockThis = {
        handleUpdateEvent: jest.fn(),
        pollForTransaction: jest.fn(),
        startPollingTask: jest.fn(),
        watchedTransactions: [],
        pollingTask: jest.fn(),
        on: jest.fn(),
      };

      const mockEventHandler = jest.fn();

      const mockEventHandlerFactory = jest.fn(() => mockEventHandler);

      transactionUpdateController.prepareEventListener.bind(mockThis)(mockEventHandlerFactory);

      expect(mockEventHandlerFactory).toHaveBeenCalled();

      expect(mockThis.on).toHaveBeenCalledWith("custodian_event", expect.any(Function));
    });
  });

  describe("handleHandShakeEvent", () => {
    it("should emit a handshake event with the provided data", () => {
      const mockData = { channelId: "channelId" };
      const spyEmit = jest.spyOn(transactionUpdateController, "emit");

      transactionUpdateController.handleHandShakeEvent(mockData);

      expect(spyEmit).toHaveBeenCalledWith("handshake", mockData);
    });
  });

  describe("handleConnectionRequestEvent", () => {
    it("should emit a connection.request event with the payload", () => {
      const connectionRequest = {
        payload: "payload",
        traceId: "traceId",
        channelId: "channelId",
      };
      const spyEmit = jest.spyOn(transactionUpdateController, "emit");

      transactionUpdateController.handleConnectionRequestEvent(connectionRequest);

      expect(spyEmit).toHaveBeenCalledWith("connection.request", connectionRequest);
    });
  });
});
