import { mocked } from "ts-jest/utils";
import { INTERACTIVE_REPLACEMENT_TOKEN_CHANGE_EVENT } from "../../constants/constants";

// So that we can access the method returned by the call factory
const jsonRpcCall = jest.fn().mockImplementation((_method: string, _params: any, _accessToken: string) => {
  return Promise.resolve({
    data: { result: "test" },
  });
});

// Mock the factory
jest.mock("./util/json-rpc-call", () => ({
  __esModule: true,
  default: (_url: string) => jsonRpcCall,
}));

import { SimpleCache } from "@metamask-institutional/simplecache";

jest.mock("@metamask-institutional/simplecache");

import { JsonRpcClient } from "./JsonRpcClient";
import fetchMock from "jest-fetch-mock";
import { mockJsonRpcCreateTransactionPayload } from "./mocks/mockJsonRpcCreateTransactionPayload";
import { mockJsonRpcSignPayload } from "./mocks/mockJsonRpcSignPayload";
import { mockJsonRpcSignTypedDataPayload } from "./mocks/mockJsonRpcSignTypedDataPayload";
import { mockJsonRpcGetSignedMessageByIdPayload } from "./mocks/mockJsonRpcGetSignedMessageByIdPayload";
import { mockJsonRpcGetTransactionByIdPayload } from "./mocks/mockJsonRpcGetTransactionByIdPayload";
import { mockJsonRpcGetTransactionLinkPayload } from "./mocks/mockJsonRpcGetTransactionLinkPayload";
fetchMock.enableMocks();

describe("JsonRpcClient", () => {
  let client: JsonRpcClient;

  const mockedSimpleCache = mocked(SimpleCache);
  let mockedSimpleCacheInstance;
  const hashedToken = "d704d4eab860b9793d8b1c03c0a0d4657908d48a5bd4b7fe0da82430b9e23e23";

  beforeEach(() => {
    jest.resetAllMocks();
    mockedSimpleCache.mockClear();
    fetchMock.resetMocks();

    client = new JsonRpcClient("http://test/json-rpc", "refresh_token", "http://refresh-token-url");

    mockedSimpleCacheInstance = mockedSimpleCache.mock.instances[0];

    fetchMock.mockResponse(
      JSON.stringify({
        access_token: "accesstoken",
        expires_in: 10,
        refresh_token: "refresh_token",
      }),
    );
  });

  describe("getAccessToken", () => {
    it("should call the refresh token URL and return the access token", async () => {
      const result = await client.getAccessToken();

      const expectedParams = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: "refresh_token",
      });
      expect(fetchMock).toHaveBeenCalledWith("http://refresh-token-url", {
        body: expectedParams,
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      expect(result).toEqual("accesstoken");
    });

    it("should return the cached version if there is a cached version", async () => {
      // Run once to set the expires_in
      await client.getAccessToken();

      mockedSimpleCacheInstance.cacheExists = jest.fn().mockReturnValue(true);
      mockedSimpleCacheInstance.cacheValid = jest.fn().mockReturnValue(false);
      mockedSimpleCacheInstance.getCache = jest.fn().mockReturnValue("cached");

      const result = await client.getAccessToken();

      expect(result).toEqual("accesstoken");
    });

    it("should not return the cached version if there is a cached version but it is invalid", async () => {
      // Run once to set the expires_in
      await client.getAccessToken();

      mockedSimpleCacheInstance.cacheExists = jest.fn().mockReturnValue(true);
      mockedSimpleCacheInstance.cacheValid = jest.fn().mockReturnValue(true);
      mockedSimpleCacheInstance.getCache = jest.fn().mockReturnValue("cached");

      const result = await client.getAccessToken();

      expect(result).toEqual("cached");
    });

    it("throws an error if there is a HTTP error", () => {
      fetchMock.mockRejectedValue(new Error("HTTP error"));

      expect(client.getAccessToken()).rejects.toThrow("HTTP error");
    });

    it.skip("emit an event if there is a HTTP 401 error status", async () => {
      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 401,
            data: { url: "test" },
          },
        };
      });

      const messageHandler = jest.fn();

      client.on(INTERACTIVE_REPLACEMENT_TOKEN_CHANGE_EVENT, messageHandler);

      try {
        await client.getAccessToken();
      } catch (e) {
        await new Promise((resolve, _reject) => {
          setTimeout(() => {
            expect(messageHandler).toHaveBeenCalledWith({
              url: "test",
              oldRefreshToken: hashedToken,
            });
            resolve(null);
          }, 100);
        });

        expect(client.getAccessToken()).rejects.toThrow("Custodian session expired");
      }
    });
  });

  describe("listAccounts", () => {
    it("should call the custodian_listAccounts method on the json rpc caller", async () => {
      await client.listAccounts();
      expect(jsonRpcCall).toHaveBeenCalledWith("custodian_listAccounts", {}, "accesstoken");
    });
  });

  describe("getCustomerProof", () => {
    it("should call the custodian_getCustomerProof method on the json rpc caller", async () => {
      await client.getCustomerProof();
      expect(jsonRpcCall).toHaveBeenCalledWith("custodian_getCustomerProof", {}, "accesstoken");
    });
  });

  describe("createTransaction", () => {
    it("should call the custodian_createTransaction method on the json rpc caller", async () => {
      await client.createTransaction(mockJsonRpcCreateTransactionPayload);

      expect(jsonRpcCall).toHaveBeenCalledWith(
        "custodian_createTransaction",
        mockJsonRpcCreateTransactionPayload,
        "accesstoken",
      );
    });
  });

  describe("listAccountChainIds", () => {
    it("should call the custodian_listAccountChainIds method on the json rpc caller", async () => {
      await client.getAccountChainIds(["0xtest"]);
      expect(jsonRpcCall).toHaveBeenCalledWith("custodian_listAccountChainIds", ["0xtest"], "accesstoken");
    });
  });

  describe("signPersonalMessage", () => {
    it("should call the custodian_sign method on the json rpc caller", async () => {
      await client.signPersonalMessage(mockJsonRpcSignPayload);
      expect(jsonRpcCall).toHaveBeenCalledWith("custodian_sign", mockJsonRpcSignPayload, "accesstoken");
    });
  });

  describe("signTypedData", () => {
    it("should call the custodian_signTypedData method on the json rpc caller", async () => {
      await client.signTypedData(mockJsonRpcSignTypedDataPayload);
      expect(jsonRpcCall).toHaveBeenCalledWith(
        "custodian_signTypedData",
        mockJsonRpcSignTypedDataPayload,
        "accesstoken",
      );
    });
  });

  describe("getSignedMessageBy", () => {
    it("should call the custodian_getSignedMessageById method on the json rpc caller", async () => {
      await client.getSignedMessage(mockJsonRpcGetSignedMessageByIdPayload);
      expect(jsonRpcCall).toHaveBeenCalledWith(
        "custodian_getSignedMessageById",
        mockJsonRpcGetSignedMessageByIdPayload,
        "accesstoken",
      );
    });
  });

  describe("getTransaction", () => {
    it("should call the custodian_getTransactionById method on the json rpc caller", async () => {
      await client.getTransaction(mockJsonRpcGetTransactionByIdPayload);
      expect(jsonRpcCall).toHaveBeenCalledWith(
        "custodian_getTransactionById",
        mockJsonRpcGetTransactionByIdPayload,
        "accesstoken",
      );
    });
  });

  describe("getTransactionLink", () => {
    it("should call the custodian_getTransactionLink method on the json rpc caller", async () => {
      await client.getTransactionLink(mockJsonRpcGetTransactionLinkPayload);
      expect(jsonRpcCall).toHaveBeenCalledWith(
        "custodian_getTransactionLink",
        mockJsonRpcGetTransactionLinkPayload,
        "accesstoken",
      );
    });
  });
});
