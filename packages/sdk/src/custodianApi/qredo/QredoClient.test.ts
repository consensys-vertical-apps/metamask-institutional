import fetchMock from "jest-fetch-mock";

import { CustodianApiError } from "../../errors/CustodianApiError";
import { MessageTypes, TypedMessage } from "../../interfaces/ITypedMessage";
import { qredoAccountsMock } from "./mocks/qredoAccountsMock";
import { qredoCustomerProofMock } from "./mocks/qredoCustomerProofMock";
import { qredoGetAccessTokenMock } from "./mocks/qredoGetAccessTokenMock";
import { qredoNetworksMock } from "./mocks/qredoNetworksMock";
import { QredoClient } from "./QredoClient";

fetchMock.enableMocks();

describe("#QredoClient", () => {
  let qredoClient: QredoClient;

  beforeAll(() => {
    qredoClient = new QredoClient("https://qredo", "token");
  });

  beforeEach(() => {
    jest.resetAllMocks();
    fetchMock.resetMocks();
  });

  describe("getAccessToken", () => {
    it("should fail if an exception is thrown by the HTTP client", async () => {
      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 400,
            data: "Fail",
          },
        };
      });

      await expect(qredoClient.getAccessToken()).rejects.toThrow(CustodianApiError);
    });

    it("should fail if no access token is returned", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ data: {} }));

      expect(qredoClient.getAccessToken()).rejects.toThrowError("No access token");
    });

    it("should call the Qredo API and get an access token", async () => {
      fetchMock.mockResponseOnce(JSON.stringify(qredoGetAccessTokenMock));

      const result = await qredoClient.getAccessToken();

      expect(result).toEqual(qredoGetAccessTokenMock.access_token);

      expect(fetchMock).toHaveBeenCalledWith("https://qredo/connect/token", {
        body: "grant_type=refresh_token&refresh_token=token",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
    });
  });

  describe("getEthereumAccounts", () => {
    it("should fail if an exception is thrown by the HTTP client", async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          access_token: "123",
          refresh_token: "token",
        }),
      );

      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 400,
            data: "Fail",
          },
        };
      });

      await expect(qredoClient.getEthereumAccounts()).rejects.toThrow(CustodianApiError);
    });

    it("should call the accounts endpoint", async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          wallets: qredoAccountsMock,
        }),
      );

      const result = await qredoClient.getEthereumAccounts();

      expect(result).toEqual(qredoAccountsMock);

      expect(fetchMock).toHaveBeenCalledWith("https://qredo/connect/wallets", {
        headers: {
          Authorization: "Bearer 123",
          "Content-Type": "application/json",
        },
      });
    });
  });

  describe("createTransaction", () => {
    it("should POST the /custodian/transaction endpoint", async () => {
      fetchMock.mockResponses(
        [JSON.stringify({ access_token: "123", refresh_token: "token" }), { status: 200 }],
        [JSON.stringify({ data: "ok" }), { status: 200 }],
      );

      await qredoClient.createTransaction(
        { from: "0xtest", chainId: "42" },
        {
          to: "test",
          value: "test",
          data: "test",
          gasLimit: "test",
          gasPrice: "test",
          from: "test",
          type: "0",
        },
      );

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("should support EIP-1559 transactions", async () => {
      fetchMock.mockResponses(
        [JSON.stringify({ access_token: "123", refresh_token: "token" }), { status: 200 }],
        [JSON.stringify({ data: "ok" }), { status: 200 }],
      );

      await qredoClient.createTransaction(
        { from: "0xtest", chainId: "42" },
        {
          to: "test",
          value: "test",
          data: "test",
          gasLimit: "test",
          maxFeePerGas: "test",
          maxPriorityFeePerGas: "test",
          from: "test",
          type: "2",
        },
      );

      expect(fetchMock).toHaveBeenCalledWith(`https://qredo/connect/transaction`, {
        body: '{"to":"test","from":"0xtest","value":"test","data":"test","gasLimit":"test","chainID":"42","maxPriorityFeePerGas":"test","maxFeePerGas":"test"}',
        headers: {
          Authorization: "Bearer 123",
          "Content-Type": "application/json",
        },
        method: "POST",
      });
    });

    it("should fail if an exception is thrown by the HTTP client", async () => {
      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 400,
            data: "Fail",
          },
        };
      });

      await expect(
        qredoClient.createTransaction(
          { from: "0xtest", chainId: "42" },
          {
            to: "test",
            value: "test",
            data: "test",
            gasLimit: "test",
            gasPrice: "test",
            from: "test",
            type: "0",
          },
        ),
      ).rejects.toThrow(CustodianApiError);
    });
  });

  describe("getTransaction", () => {
    it("should GET the /custodian/transaction/:id endpoint", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({}));

      const result = await qredoClient.getTransaction("xxx");

      expect(fetchMock).toHaveBeenCalledWith("https://qredo/connect/transaction/xxx", {
        headers: {
          Authorization: "Bearer 123",
          "Content-Type": "application/json",
        },
      });

      expect(result).toEqual({});
    });

    it("should fail if an exception is thrown by the HTTP client", async () => {
      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 400,
            data: "Fail",
          },
        };
      });

      await expect(qredoClient.getTransaction("xxx")).rejects.toThrow(CustodianApiError);
    });
  });

  describe("getTransactions", () => {
    it("should throw an error", async () => {
      await expect(qredoClient.getTransactions()).rejects.toThrowError("Not implemented yet");
    });
  });

  describe("getCustomerProof", () => {
    it("should fail if an exception is thrown by the HTTP client", async () => {
      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 400,
            data: "Fail",
          },
        };
      });

      await expect(qredoClient.getCustomerProof()).rejects.toThrow(CustodianApiError);
    });

    it("should call the customer proof endpoint", async () => {
      fetchMock.mockResponses(
        [JSON.stringify({ access_token: "123", refresh_token: "token" }), { status: 200 }],
        [JSON.stringify({ qredoCustomerProofMock }), { status: 200 }],
      );

      await qredoClient.getCustomerProof();

      expect(fetchMock).toHaveBeenLastCalledWith("https://qredo/connect/customer-proof", {
        headers: {
          Authorization: "Bearer 123",
          "Content-Type": "application/json",
        },
        method: "POST",
      });
    });
  });

  describe("getSignedMessage", () => {
    it("should GET the /custodian/sign/:id endpoint", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({}));

      const result = await qredoClient.getSignedMessage("xxx");

      expect(fetchMock).toHaveBeenCalledWith("https://qredo/connect/sign/xxx", {
        headers: {
          Authorization: "Bearer 123",
          "Content-Type": "application/json",
        },
      });

      expect(result).toEqual({});
    });

    it("should fail if an exception is thrown by the HTTP client", async () => {
      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 400,
            data: "Fail",
          },
        };
      });

      await expect(qredoClient.getSignedMessage("xxx")).rejects.toThrow(CustodianApiError);
    });
  });

  describe("getNetworks", () => {
    it("should call the qredo /networks endpoint", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ qredoNetworksMock }));

      await qredoClient.getNetworks();

      expect(fetchMock).toHaveBeenCalledWith("https://qredo/connect/networks", {
        headers: {
          Authorization: "Bearer 123",
          "Content-Type": "application/json",
        },
      });
    });

    it("should fail if an exception is thrown by the HTTP client", async () => {
      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 400,
            data: "Fail",
          },
        };
      });

      await expect(qredoClient.getNetworks()).rejects.toThrow(CustodianApiError);
    });
  });

  describe("QredoClient#signPersonalMessage", () => {
    it("should POST the /sign endpoint", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ data: "ok" }));

      const message = "0xdeadbeef";

      await qredoClient.signPersonalMessage("test", message);

      expect(fetchMock).toHaveBeenCalledWith(`https://qredo/connect/sign`, {
        body: '{"from":"test","message":"0xdeadbeef"}',
        headers: {
          Authorization: "Bearer 123",
          "Content-Type": "application/json",
        },
        method: "POST",
      });
    });

    it("should fail if an exception is thrown by the HTTP client", async () => {
      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 400,
            data: "Fail",
          },
        };
      });
      const message = "0xdeadbeef";

      expect(qredoClient.signPersonalMessage("test", message)).rejects.toThrow(CustodianApiError);
    });
  });

  describe("QredoClient#signTypedData_v4", () => {
    it("should POST the /sign endpoint", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ data: "ok" }));

      const buffer: TypedMessage<MessageTypes> = {
        types: {
          EIP712Domain: [],
        },
        primaryType: "test",
        domain: {
          name: "test",
        },
        message: {},
      };

      await qredoClient.signTypedData_v4("test", buffer);

      expect(fetchMock).toHaveBeenCalledWith(`https://qredo/connect/sign`, {
        body: '{"from":"test","payload":{"types":{"EIP712Domain":[]},"primaryType":"test","domain":{"name":"test"},"message":{}}}',
        headers: {
          Authorization: "Bearer 123",
          "Content-Type": "application/json",
        },
        method: "POST",
      });
    });

    it("should fail if an exception is thrown by the HTTP client", async () => {
      fetchMock.mockImplementationOnce(() => {
        throw {
          response: {
            status: 400,
            data: "Fail",
          },
        };
      });

      const buffer: TypedMessage<MessageTypes> = {
        types: {
          EIP712Domain: [],
        },
        primaryType: "test",
        domain: {
          name: "test",
        },
        message: {},
      };

      expect(qredoClient.signTypedData_v4("test", buffer)).rejects.toThrow(CustodianApiError);
    });
  });
});
