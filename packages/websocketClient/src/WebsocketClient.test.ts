import { ICustodianApi, JsonRpcCustodianApi } from "@metamask-institutional/sdk";
import { WebSocket as MockWebSocket, Server } from "mock-socket";

import { WebsocketClientController } from "./WebsocketClient";

jest.mock("@metamask-institutional/sdk");

global.WebSocket = MockWebSocket;

const wsApiUrl = "wss://api/";

describe("websocketClientController", () => {
  let websocketClientController: WebsocketClientController;
  let mockedJsonRpcCustodianApi: ICustodianApi;
  let getCustodyKeyring;
  let getCustomerProof;
  let getStatusMap;
  let handleUpdateEvent;
  let onFailure;
  let mockMmiConfigurationController;

  let onReconnect;

  const mockServer = new Server(wsApiUrl);

  beforeEach(() => {
    onFailure = jest.fn();
    handleUpdateEvent = jest.fn();
    getCustomerProof = jest.fn(() => Promise.resolve("eyJhbGciOiJIUzI1NiJ9"));
    getStatusMap = jest.fn();
    onReconnect = jest.fn();
    mockedJsonRpcCustodianApi = new JsonRpcCustodianApi(null, null, null, null);
    getCustodyKeyring = jest.fn(() =>
      Promise.resolve({
        sdkList: { sdk: mockedJsonRpcCustodianApi },
        getCustomerProof,
        getStatusMap,
      }),
    );

    mockMmiConfigurationController = {
      getWebsocketApiUrl: jest.fn().mockReturnValue(wsApiUrl),
      store: {
        getState: jest.fn().mockReturnValue({
          mmiConfiguration: {
            custodians: [
              {
                apiUrl: "https://api",
              },
            ],
          },
        }),
      },
      configurationClient: {},
      storeConfiguration: jest.fn(),
      getConfiguration: jest.fn(),
    };
    jest.useFakeTimers();
    jest.spyOn(global, "setInterval");

    websocketClientController = new WebsocketClientController({
      handleUpdateEvent,
      getCustodyKeyring,
      onFailure,
      mmiConfigurationController: mockMmiConfigurationController,
      captureException: jest.fn(),
      onReconnect,
    });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe("onMessage", () => {
    it("should call parseEvent when a new message is received", () => {
      const event = {
        data: '{"event":"custodian_update","data":{}}',
      };

      websocketClientController.onMessage(event as any);
      expect(handleUpdateEvent).toHaveBeenCalled();
    });
  });

  describe("onOpen", () => {
    it("should call onOpen when a connection opens", () => {
      const mockThis = {
        onReconnect: jest.fn(),
        ws: {
          close: jest.fn(),
          readyState: 0,
          OPEN: 3,
        },
      };

      const logSpy = jest.spyOn(console, "log");
      const event = {
        data: '{"event":"custodian_update","data":{}}',
      };

      websocketClientController.onOpen.bind(mockThis)(event);

      expect(logSpy).toHaveBeenCalled();
    });
  });

  describe("onError", () => {
    it("should call onError when an error occurs", () => {
      const mockThis = {
        ws: {
          close: jest.fn(),
        },
      };

      const logSpy = jest.spyOn(console, "log");
      const event = {
        data: '{"event":"error","data":{}}',
      };

      websocketClientController.onError.bind(mockThis)(event);

      expect(logSpy).toHaveBeenCalled();
    });
  });

  describe("keepAlive", () => {
    it("should call WS send in keepAlive method", () => {
      const mockThis = {
        keepAlive: jest.fn(),
        ws: {
          send: jest.fn(),
          close: jest.fn(),
          readyState: 1,
          OPEN: 1,
        },
      };

      websocketClientController.keepAlive.bind(mockThis)();

      expect(mockThis.ws.send).toHaveBeenCalled();
    });
  });

  describe("onClose", () => {
    it("should call tryToReconnect and cancelKeepAlive", () => {
      const mockThis = {
        parseEvent: jest.fn(),
        tryToReconnect: jest.fn(),
        cancelKeepAlive: jest.fn(),
      };

      const msgEvent = {
        wasClean: false,
        data: {
          event: "custodian_update",
          data: {},
        },
      };

      websocketClientController.onClose.bind(mockThis)(msgEvent);

      expect(mockThis.tryToReconnect).toHaveBeenCalled();
      expect(mockThis.cancelKeepAlive).toHaveBeenCalled();
    });
  });

  describe("requestStreamForCustomerProof", () => {
    it("should call for WS send method in the requestStreamForCustomerProof", async () => {
      jest.useRealTimers();

      jest.spyOn(websocketClientController, "keepAlive"); // stop timer from messing things up

      const connectionHandler = ws => {
        ws.on("message", (message: string) => {
          const data = JSON.parse(message);

          expect(data.event).toEqual("request_stream");
          if (data.data.customerProof === "customer-proof-succeed") {
            const requestId = data.data.requestId;

            ws.send(
              JSON.stringify({
                data: { streamSubject: "ok", requestId },
                event: "request_stream",
              }),
            );
          }
        });
      };

      mockServer.on("connection", connectionHandler);

      websocketClientController.connectWS();

      const result = await websocketClientController.requestStreamForCustomerProof("customer-proof-succeed");

      jest.clearAllTimers();

      expect(result.streamSubject).toEqual("ok");
    });

    it("should throw an exception if it receives an error", async () => {
      jest.useRealTimers();

      jest.spyOn(websocketClientController, "keepAlive"); // stop timer from messing things up

      const connectionHandler = ws => {
        ws.on("message", (message: string) => {
          const data = JSON.parse(message);
          expect(data.event).toEqual("request_stream");

          if (data.data.customerProof === "customer-proof-fail") {
            const requestId = data.data.requestId;

            ws.send(JSON.stringify({ error: { message: "fail", requestId } }));
          }
        });
      };

      mockServer.on("connection", connectionHandler);

      websocketClientController.connectWS();

      const promise = websocketClientController.requestStreamForCustomerProof("customer-proof-fail");

      await expect(promise).rejects.toMatchObject({ message: "fail" });
    });
  });

  describe("tryToReconnect", () => {
    it("should return out of function if readyState === OPEN", () => {
      const mockThis = {
        onFailure: jest.fn(),
        ws: {
          close: jest.fn(),
          readyState: 1,
          OPEN: 1,
        },
      };

      websocketClientController.tryToReconnect.bind(mockThis)();

      expect(mockThis.onFailure).not.toHaveBeenCalled();
    });

    it("should fallback to polling whenn the number of retries has reached", () => {
      jest.useFakeTimers();

      const mockThis = {
        onFailure: jest.fn(),
        getTimeElapsed: jest.fn(),
        onWebsocketClose: jest.fn(),
        connectWS: jest.fn(),
        RETRY_ATTEMPTS_LIMIT: 3,
        RETRY_ATTEMPTS: 3,
        ws: {
          close: jest.fn(),
          readyState: 0,
          OPEN: 3,
        },
      };

      websocketClientController.tryToReconnect.bind(mockThis)();

      expect(mockThis.RETRY_ATTEMPTS).toBe(0);
      expect(mockThis.onFailure).toHaveBeenCalled();
      expect(mockThis.onWebsocketClose).toHaveBeenCalled();
    });
  });

  describe("connectWS", () => {
    it("should call keepAlive method when connecting to the WS server", done => {
      jest.useRealTimers();

      const mockThis = {
        keepAlive: jest.fn(),
        onOpen: jest.fn(),
        onMessage: jest.fn(),
        onError: jest.fn(),
        onClose: jest.fn(),
        mmiConfigurationController: mockMmiConfigurationController,
        handleUpdateEvent: jest.fn(),
      };

      websocketClientController.connectWS.bind(mockThis)();

      expect(mockThis.keepAlive).toHaveBeenCalled();

      mockServer.on("connection", socket => {
        expect(mockThis.onOpen).toHaveBeenCalled();

        socket.send("test");

        setTimeout(() => {
          expect(mockThis.onMessage).toHaveBeenCalled();
          done();
        });
      });
    });
  });
});
