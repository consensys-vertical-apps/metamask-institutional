import fetchMock from "jest-fetch-mock";
import { CustodianApiError } from "../../errors/CustodianApiError";
import { MessageTypes, TypedMessage } from "../../interfaces/ITypedMessage";

import { JupiterClient } from "./JupiterClient";
fetchMock.enableMocks();

describe("JupiterClient", () => {
  let jupiterClient: JupiterClient;

  const mockJwt = "mock-jwt";
  const mockUrl = "http://mock-url";

  beforeAll(() => {
    jupiterClient = new JupiterClient(mockUrl, mockJwt);
  });

  beforeEach(() => {
    jest.resetAllMocks();
    fetchMock.resetMocks();
  });

  describe("JupiterClient#getHeaders", () => {
    it("should return headers with the JWT in the authorization field", () => {
      const result = jupiterClient.getHeaders();

      expect(result).toEqual({ Authorization: `Bearer ${mockJwt}` });
    });
  });

  describe("JupiterClient#getEthereumAccounts", () => {
    it("should GET the /custodian/account endpoint", async () => {
      fetchMock.mockResponseOnce(JSON.stringify([]));

      const result = await jupiterClient.getEthereumAccounts();

      expect(fetchMock).toHaveBeenCalledWith(`${mockUrl}/custodian/account`, {
        headers: {
          Authorization: `Bearer ${mockJwt}`,
        },
      });

      expect(result).toEqual([]);
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

      expect(jupiterClient.getEthereumAccounts()).rejects.toThrow(CustodianApiError);
    });
  });

  describe("JupiterClient#createTransaction", () => {
    it("should POST the /custodian/transaction endpoint", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ data: "ok" }));

      await jupiterClient.createTransaction(
        { accountId: "test", chainId: "4" },
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

      expect(fetchMock).toHaveBeenCalledWith(`${mockUrl}/custodian/transaction`, {
        body: '{"to":"test","accountId":"test","value":"test","data":"test","type":"0","gasLimit":"test","network":"4","gasPrice":"test"}',
        headers: {
          Authorization: "Bearer mock-jwt",
        },
        method: "POST",
      });
    });

    it("should POST the /custodian/transaction endpoint with EIP-1559 params", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ data: "ok" }));

      await jupiterClient.createTransaction(
        { accountId: "test", chainId: "4" },
        {
          to: "test",
          value: "test",
          data: "test",
          gasLimit: "test",
          maxPriorityFeePerGas: "test",
          maxFeePerGas: "test",
          from: "test",
          type: "2",
        },
      );

      expect(fetchMock).toHaveBeenCalledWith(`${mockUrl}/custodian/transaction`, {
        body: '{"to":"test","accountId":"test","value":"test","data":"test","type":"2","gasLimit":"test","network":"4","maxPriorityFeePerGas":"test","maxFeePerGas":"test"}',
        headers: {
          Authorization: "Bearer mock-jwt",
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

      expect(
        jupiterClient.createTransaction(
          { accountId: "test", chainId: "4" },
          {
            to: "test",
            value: "test",
            data: "test",
            gasLimit: "test",
            gasPrice: "test",
            from: "test",
          },
        ),
      ).rejects.toThrow(CustodianApiError);
    });
  });

  describe("JupiterClient#getTransactions", () => {
    it("should GET the /custodian/transaction endpoint", async () => {
      fetchMock.mockResponseOnce(JSON.stringify([]));

      const result = await jupiterClient.getTransactions();

      expect(fetchMock).toHaveBeenCalledWith(`${mockUrl}/custodian/transaction`, {
        headers: {
          Authorization: `Bearer ${mockJwt}`,
        },
      });

      expect(result).toEqual([]);
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

      expect(jupiterClient.getTransactions()).rejects.toThrow(CustodianApiError);
    });
  });

  describe("JupiterClient#getTransaction", () => {
    it("should GET the /custodian/transaction/:id endpoint", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({}));

      const result = await jupiterClient.getTransaction("xxx");

      expect(fetchMock).toHaveBeenCalledWith(`${mockUrl}/custodian/transaction/xxx`, {
        headers: {
          Authorization: `Bearer ${mockJwt}`,
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

      expect(jupiterClient.getTransaction("xxx")).rejects.toThrow(CustodianApiError);
    });
  });

  describe("JupiterClient#getCustomerProof", () => {
    it("should POST the /custodian/customer-proof endpoint", async () => {
      fetchMock.mockResponseOnce(JSON.stringify("ok"));

      const result = await jupiterClient.getCustomerProof("customerId", "issuer");
      expect(result).toEqual("ok");

      expect(fetchMock).toHaveBeenCalledWith(`${mockUrl}/customer-proof`, {
        body: '{"customerId":"customerId","issuer":"issuer","custodian":"jupiter"}',
        headers: {
          Authorization: "Bearer mock-jwt",
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

      expect(jupiterClient.getCustomerProof("customerId", "issuer")).rejects.toThrow(CustodianApiError);
    });
  });

  describe("JupiterClient#signTypedData_v4", () => {
    it("should POST the /custodian/signature endpoint", async () => {
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

      await jupiterClient.signTypedData_v4("test", buffer, "V4");

      expect(fetchMock).toHaveBeenCalledWith(`${mockUrl}/custodian/signature`, {
        body: '{"accountId":"test","payload":{"types":{"EIP712Domain":[]},"primaryType":"test","domain":{"name":"test"},"message":{}},"signatureVersion":"V4"}',
        headers: {
          Authorization: "Bearer mock-jwt",
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

      expect(jupiterClient.signTypedData_v4("test", buffer, "V4")).rejects.toThrow(CustodianApiError);
    });
  });

  describe("JupiterClient#signPersonalMessage", () => {
    it("should POST the /custodian/personal-signature endpoint", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ data: "ok" }));

      const buffer = "0xdeadbeef";

      await jupiterClient.signPersonalMessage("test", buffer);

      expect(fetchMock).toHaveBeenCalledWith(`${mockUrl}/custodian/personal-signature`, {
        body: '{"accountId":"test","payload":"0xdeadbeef"}',
        headers: {
          Authorization: "Bearer mock-jwt",
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
      const buffer = "0xdeadbeef";

      expect(jupiterClient.signPersonalMessage("test", buffer)).rejects.toThrow(CustodianApiError);
    });
  });

  describe("getSupportedChains", () => {
    it("should call the network endpoint on the Jupiter API", async () => {
      fetchMock.mockResponseOnce(JSON.stringify([]));

      const result = await jupiterClient.getSupportedChains();

      expect(fetchMock).toHaveBeenCalledWith(`${mockUrl}/custodian/networks`, {
        headers: {
          Authorization: `Bearer ${mockJwt}`,
        },
      });

      expect(result).toEqual([]);
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

      expect(jupiterClient.getSupportedChains()).rejects.toThrow(CustodianApiError);
    });
  });
});
