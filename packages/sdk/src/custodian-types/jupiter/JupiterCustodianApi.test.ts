import { JupiterClient } from "./JupiterClient";
import { mocked } from "ts-jest/utils";

jest.mock("./JupiterClient");
import { getTokenIssuer } from "../../util/get-token-issuer";

jest.mock("../../util/get-token-issuer", () => ({
  getTokenIssuer: jest.fn().mockReturnValue("some_website"),
}));

import { JupiterCustodianApi } from "./JupiterCustodianApi";
import { ITransactionDetails, AuthTypes } from "@metamask-institutional/types";
import { MessageTypes, TypedMessage } from "../../interfaces/ITypedMessage";
import { jupiterAccountsMock } from "./mocks/jupiterAccountsMock";
import { jupiterCustomerProofMock } from "./mocks/jupiterCustomerProofMock";
import { jupiterTransactionMock } from "./mocks/jupiterTransactionMock";
import { jupiterCreateEIP712SignatureMock } from "./mocks/jupiterCreateEIP712SignatureMock";
import { jupiterCreatePersonalSignatureMock } from "./mocks/jupiterCreatePersonalSignatureMock";

describe("JupiterCustodianApi", () => {
  let jupiterCustodianApi: JupiterCustodianApi;
  const mockedJupiterClient = mocked(JupiterClient, true);
  let mockedJupiterClientInstance;
  const mockedGetTokenIssuer = mocked(getTokenIssuer);

  const mockJwt = "mock-jwt";
  const mockUrl = "http://mock-url";

  beforeEach(() => {
    jupiterCustodianApi = new JupiterCustodianApi(
      { jwt: mockJwt },
      AuthTypes.TOKEN,
      mockUrl,
      0
    );

    mockedJupiterClientInstance = mockedJupiterClient.mock.instances[0];
    mockedJupiterClientInstance.getEthereumAccounts = jest
      .fn()
      .mockImplementation(() => jupiterAccountsMock);

    mockedJupiterClientInstance.getTransactions = jest
      .fn()
      .mockImplementation(() => [jupiterTransactionMock]);

    mockedJupiterClientInstance.getTransaction = jest
      .fn()
      .mockImplementation(() => jupiterTransactionMock);

    mockedJupiterClientInstance.createTransaction = jest
      .fn()
      .mockImplementation(() => jupiterTransactionMock);

    mockedJupiterClientInstance.getCustomerProof = jest
      .fn()
      .mockImplementation(() => jupiterCustomerProofMock);

    mockedJupiterClientInstance.signTypedData_v4 = jest
      .fn()
      .mockImplementation(() => jupiterCreateEIP712SignatureMock);

    mockedJupiterClientInstance.signPersonalMessage = jest
      .fn()
      .mockImplementation(() => jupiterCreatePersonalSignatureMock);

    mockedJupiterClientInstance.getSupportedChains = jest
      .fn()
      .mockImplementation(() => ({ "4": "rinkeby" }));

    mockedJupiterClient.mockClear();
  });

  describe("JupiterCustodianApi#getAccountHierarchy", () => {
    it("does nothing", async () => {
      const result = await jupiterCustodianApi.getAccountHierarchy();

      expect(result).toEqual(null);
    });
  });

  describe("JupiterCustodianApi#getEthereumAccounts", () => {
    it("returns the accounts", async () => {
      const result = await jupiterCustodianApi.getEthereumAccounts();
      expect(
        mockedJupiterClientInstance.getEthereumAccounts
      ).toHaveBeenCalled();

      expect(result).toEqual(
        jupiterAccountsMock.map((account) => ({
          name: account.label,
          address: account.address,
          balance: account.balance,
          custodianDetails: {
            accountId: account.id,
          },
          labels: [{ key: "label", value: account.label }],
        }))
      );
    });
  });

  describe("JupiterCustodianApi#getEthereumAccountsByAddress", () => {
    it("fetches the ethereum accounts for a given address", async () => {
      const result = await jupiterCustodianApi.getEthereumAccountsByAddress(
        "0xb"
      );

      expect(result.length).toBe(
        jupiterAccountsMock.filter((acc) => acc.address.startsWith("0xb"))
          .length
      );
    });
  });

  describe("JupiterCustodianApi#getEthereumAccountsByLabelOrAddressName", () => {
    it("fetches the ethereum accounts based on label or address name", async () => {
      const result = await jupiterCustodianApi.getEthereumAccountsByLabelOrAddressName(
        "Impressive"
      );

      expect(result.length).toBe(
        jupiterAccountsMock.filter((acc) => acc.label.includes("Impressive"))
          .length
      );
    });
  });

  describe("JupiterCustodianApi#createTransaction", () => {
    it("finds the account, then calls client.createTransaction", async () => {
      const fromAddress = jupiterAccountsMock[0].address;
      const txParams = {
        from: fromAddress,
        to: "to",
        value: "1",
        gasPrice: "1",
        gasLimit: "1", // No data
      };

      await jupiterCustodianApi.createTransaction(txParams, { chainId: "4" });

      expect(
        mockedJupiterClientInstance.getEthereumAccounts
      ).toHaveBeenCalled();

      expect(
        mockedJupiterClientInstance.createTransaction
      ).toHaveBeenCalledWith(
        {
          accountId: jupiterAccountsMock[0].id,
          chainId: "4",
        },
        txParams
      );
    });

    it("throws if the ethereum account does not exist when we search by wallet", async () => {
      mockedJupiterClientInstance.getEthereumAccounts = jest
        .fn()
        .mockImplementationOnce(() => []);

      const fromAddress = jupiterAccountsMock[0].address;
      const txParams = {
        from: fromAddress,
        to: "to",
        value: "1",
        gasPrice: "1",
        gasLimit: "1", // No data
      };

      expect(
        jupiterCustodianApi.createTransaction(
          {
            ...txParams,
            from: "does-not-exist1",
          },
          { chainId: "4" }
        )
      ).rejects.toThrow("No such ethereum account");
    });
  });

  describe("JupiterCustodianApi#getTransaction", () => {
    it("gets all the transactions and filters them", async () => {
      const result: ITransactionDetails = await jupiterCustodianApi.getTransaction(
        "0x",
        jupiterTransactionMock.id
      );

      expect(result).toEqual({
        transactionHash: jupiterTransactionMock.transactionHash,
        transactionStatus: jupiterTransactionMock.transactionStatus,
        custodian_transactionId: jupiterTransactionMock.id,
        from: jupiterTransactionMock.from,
        gasPrice: jupiterTransactionMock.gasPrice,
        gasLimit: jupiterTransactionMock.gasLimit,
        nonce: jupiterTransactionMock.nonce,
        maxFeePerGas: jupiterTransactionMock.maxFeePerGas,
        maxPriorityFeePerGas: jupiterTransactionMock.maxPriorityFeePerGas,
      });

      expect(mockedJupiterClientInstance.getTransaction).toHaveBeenCalledWith(
        jupiterTransactionMock.id
      );
    });
  });

  describe("JupiterCustodianApi#getCustomerId", () => {
    it("should call getOrganizations and return the id of the first organization that is returned", async () => {
      const result = await jupiterCustodianApi.getCustomerId();
      expect(result).toEqual("jupiter-customer");
    });
  });

  describe("JupiterCustodianApi#getAllTransactions", () => {
    it("should call getTransactions for the customer corresponding to the first organization", async () => {
      await jupiterCustodianApi.getAllTransactions();
      expect(mockedJupiterClientInstance.getTransactions).toHaveBeenCalled();
    });
  });

  describe("JupiterCustodianApi#signPersonalMessage", () => {
    it("finds an ethereum address, then calls client.signPersonalMessage", async () => {
      const fromAddress = jupiterAccountsMock[0].address;

      const buffer = "0xdeadbeef";

      const result = await jupiterCustodianApi.signPersonalMessage(
        fromAddress,
        buffer
      );

      expect(result).toEqual({
        from: fromAddress,
        transactionStatus: jupiterCreatePersonalSignatureMock.transactionStatus,
        custodian_transactionId: jupiterCreatePersonalSignatureMock.id,
      });

      expect(
        mockedJupiterClientInstance.getEthereumAccounts
      ).toHaveBeenCalled();

      expect(
        mockedJupiterClientInstance.signPersonalMessage
      ).toHaveBeenCalledWith(jupiterAccountsMock[0].id, buffer);
    });

    it("throws if the ethereum account does not exist when we search by wallet", async () => {
      mockedJupiterClientInstance.getEthereumAccounts = jest
        .fn()
        .mockImplementationOnce(() => []);

      const buffer = "0xdeadbeef";
      const fromAddress = jupiterAccountsMock[0].address;

      expect(
        jupiterCustodianApi.signPersonalMessage(fromAddress, buffer)
      ).rejects.toThrow("No such ethereum account");
    });
  });

  describe("JupiterCustodianApi#signTypedData_v4", () => {
    it("finds an ethereum address, then calls client.signTypedData_v4", async () => {
      const fromAddress = jupiterAccountsMock[0].address;

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

      const result = await jupiterCustodianApi.signTypedData_v4(
        fromAddress,
        buffer,
        "V4"
      );

      expect(result).toEqual({
        from: fromAddress,
        transactionStatus: jupiterCreateEIP712SignatureMock.transactionStatus,
        custodian_transactionId: jupiterCreateEIP712SignatureMock.id,
      });

      expect(
        mockedJupiterClientInstance.getEthereumAccounts
      ).toHaveBeenCalled();

      expect(mockedJupiterClientInstance.signTypedData_v4).toHaveBeenCalledWith(
        jupiterAccountsMock[0].id,
        buffer,
        "V4"
      );
    });

    it("throws if the ethereum account does not exist when we search by wallet", async () => {
      mockedJupiterClientInstance.getEthereumAccounts = jest
        .fn()
        .mockImplementationOnce(() => []);

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
      const fromAddress = jupiterAccountsMock[0].address;

      expect(
        jupiterCustodianApi.signTypedData_v4(fromAddress, buffer, "V4")
      ).rejects.toThrow("No such ethereum account");
    });
  });

  describe("JupiterCustodianApi#getCustomerProof", () => {
    it("calls getCustomerProof on the client and returns the token", async () => {
      const result = await jupiterCustodianApi.getCustomerProof();

      expect(result).toEqual(jupiterCustomerProofMock.jwt);

      expect(mockedJupiterClientInstance.getCustomerProof).toHaveBeenCalledWith(
        "jupiter-customer",
        "some_website"
      );
    });
  });

  describe("JupiterCustodianApi#getErc20Tokens", () => {
    it("returns an empty object", async () => {
      const result = await jupiterCustodianApi.getErc20Tokens();

      expect(result).toEqual({});
    });
  });

  describe("JupiterCustodianApi#getTransactionLink", () => {
    it("resolves to null", async () => {
      const result = await jupiterCustodianApi.getTransactionLink("xxx");

      expect(result).toEqual(null);
    });
  });

  describe("JupiterCustodianApi#getSupportedChains", () => {
    it("calls the client", async () => {
      const result = await jupiterCustodianApi.getSupportedChains();

      expect(mockedJupiterClientInstance.getSupportedChains).toHaveBeenCalled();

      expect(result).toEqual(["4"]);
    });
  });
});
