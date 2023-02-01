import { AuthTypes, ISignatureDetails, ITransactionDetails } from "@metamask-institutional/types";
import { mocked } from "ts-jest/utils";

import { MessageTypes, TypedMessage } from "../../interfaces/ITypedMessage";
import { CactusClient } from "./CactusClient";
import { CactusCustodianApi } from "./CactusCustodianApi";
import { mockCactusCreateSignatureResponse } from "./mocks/mockCactusCreateSignatureResponse";
import { mockCactusCreateTransactionResult } from "./mocks/mockCactusCreateTransactionResult";
import { mockCactusGetChainIdsResponse } from "./mocks/mockCactusGetChainIdsResponse";
import { mockCactusGetCustomerProofResponse } from "./mocks/mockCactusGetCustomerProofResponse";
import { mockCactusGetEthereumAccountsResponse } from "./mocks/mockCactusGetEthereumAccountsResponse";
import { mockCactusGetSignedMessageResponse } from "./mocks/mockCactusGetSignedMessageResponse";
import { mockCactusGetTransactionsResult } from "./mocks/mockCactusGetTransactionsResult";

jest.mock("./CactusClient");

jest.mock("../../util/get-token-issuer", () => ({
  getTokenIssuer: jest.fn().mockReturnValue("some_website"),
}));

describe("CactusCustodianApi", () => {
  let cactusCustodianApi: CactusCustodianApi;
  const mockedCactusClient = mocked(CactusClient, true);
  let mockedCactusClientInstance;

  const mockRefreshToken = "mockRefreshToken";
  const mockUrl = "http://mock-url";

  beforeEach(() => {
    cactusCustodianApi = new CactusCustodianApi({ refreshToken: mockRefreshToken }, AuthTypes.TOKEN, mockUrl, 0);

    mockedCactusClientInstance = mockedCactusClient.mock.instances[0];
    mockedCactusClientInstance.getEthereumAccounts = jest
      .fn()
      .mockImplementation(() => mockCactusGetEthereumAccountsResponse);

    mockedCactusClientInstance.getTransactions = jest.fn().mockImplementation(() => mockCactusGetTransactionsResult);

    mockedCactusClientInstance.getTransaction = jest.fn().mockImplementation(() => mockCactusGetTransactionsResult[0]);

    mockedCactusClientInstance.createTransaction = jest
      .fn()
      .mockImplementation(() => mockCactusCreateTransactionResult);

    mockedCactusClientInstance.getCustomerProof = jest
      .fn()
      .mockImplementation(() => mockCactusGetCustomerProofResponse);

    mockedCactusClientInstance.signTypedData_v4 = jest.fn().mockImplementation(() => mockCactusCreateSignatureResponse);

    mockedCactusClientInstance.signPersonalMessage = jest
      .fn()
      .mockImplementation(() => mockCactusCreateSignatureResponse);

    mockedCactusClientInstance.getChainIds = jest.fn().mockImplementation(() => mockCactusGetChainIdsResponse);

    mockedCactusClientInstance.getSignedMessage = jest
      .fn()
      .mockImplementation(() => mockCactusGetSignedMessageResponse);

    mockedCactusClient.mockClear();
  });

  describe("CactusCustodianApi#getAccountHierarchy", () => {
    it("does nothing", async () => {
      const result = await cactusCustodianApi.getAccountHierarchy();

      expect(result).toEqual(null);
    });
  });

  describe("CactusCustodianApi#getEthereumAccounts", () => {
    it("returns the accounts", async () => {
      const result = await cactusCustodianApi.getEthereumAccounts();
      expect(mockedCactusClientInstance.getEthereumAccounts).toHaveBeenCalled();

      expect(result).toEqual(
        mockCactusGetEthereumAccountsResponse.map(account => ({
          name: account.name || "Cactus wallet",
          address: account.address,
          balance: account.balance,
          custodianDetails: {
            walletId: account.custodianDetails.walletId,
            chainId: account.chainId,
          },
          labels: account.labels ? account.labels.map(label => ({ key: "label", value: label })) : [],
        })),
      );
    });
  });

  describe("CactusCustodianApi#getEthereumAccountsByAddress", () => {
    it("fetches the ethereum accounts for a given address", async () => {
      const result = await cactusCustodianApi.getEthereumAccountsByAddress("0xB");

      expect(result.length).toBe(
        mockCactusGetEthereumAccountsResponse.filter(acc => acc.address.startsWith("0xB")).length,
      );
    });
  });

  describe("CactusCustodianApi#getEthereumAccountsByLabelOrAddressName", () => {
    it("fetches the ethereum accounts based on label or address name", async () => {
      const result = await cactusCustodianApi.getEthereumAccountsByLabelOrAddressName("test-label");

      expect(result.length).toBe(
        mockCactusGetEthereumAccountsResponse.filter(acc => acc.name.includes("test-label")).length,
      );
    });

    it("returns them all if there is no name filter", async () => {
      const result = await cactusCustodianApi.getEthereumAccountsByLabelOrAddressName("");

      expect(result.length).toBe(mockCactusGetEthereumAccountsResponse.length);
    });
  });

  describe("CactusCustodianApi#createTransaction", () => {
    it("finds the account, then calls client.createTransaction", async () => {
      const fromAddress = mockCactusGetEthereumAccountsResponse[0].address;
      const txParams = {
        from: fromAddress,
        to: "to",
        value: "1",
        gasPrice: "1",
        gasLimit: "1", // No data
        note: "note",
      };

      await cactusCustodianApi.createTransaction(txParams, { chainId: "4" });

      expect(mockedCactusClientInstance.createTransaction).toHaveBeenCalledWith(
        {
          chainId: 4,
        },
        txParams,
      );
    });
  });

  describe("CactusCustodianApi#getTransaction", () => {
    it("gets a single transaction by id", async () => {
      const result: ITransactionDetails = await cactusCustodianApi.getTransaction(
        "0x",
        mockCactusGetTransactionsResult[0].custodian_transactionId,
      );

      expect(result).toEqual({
        transactionHash: mockCactusGetTransactionsResult[0].transactionHash,
        transactionStatus: mockCactusGetTransactionsResult[0].transactionStatus,
        custodian_transactionId: mockCactusGetTransactionsResult[0].custodian_transactionId,
        from: mockCactusGetTransactionsResult[0].from,
        gasPrice: mockCactusGetTransactionsResult[0].gasPrice,
        gasLimit: mockCactusGetTransactionsResult[0].gasLimit,
        nonce: mockCactusGetTransactionsResult[0].nonce,
        maxFeePerGas: mockCactusGetTransactionsResult[0].maxFeePerGas,
        maxPriorityFeePerGas: mockCactusGetTransactionsResult[0].maxPriorityFeePerGas,
      });

      expect(mockedCactusClientInstance.getTransaction).toHaveBeenCalledWith(
        mockCactusGetTransactionsResult[0].custodian_transactionId,
      );
    });

    it("returns null if the client returns null", async () => {
      mockedCactusClientInstance.getTransaction = jest.fn().mockResolvedValueOnce(null);

      const result: ITransactionDetails = await cactusCustodianApi.getTransaction(
        "0x",
        mockCactusGetTransactionsResult[0].custodian_transactionId,
      );

      expect(result).toEqual(null);
    });
  });

  describe("CactusCustodianApi#getCustomerId", () => {
    it("returns a random string as this is not used", async () => {
      const result = await cactusCustodianApi.getCustomerId();
      expect(result).toEqual("cactus-customer");
    });
  });

  describe("CactusCustodianApi#getAllTransactions", () => {
    it("is not implemented", async () => {
      await expect(cactusCustodianApi.getAllTransactions()).rejects.toThrowError("Not implemented");
    });
  });

  describe("CactusCustodianApi#signPersonalMessage", () => {
    it("throws an error", async () => {
      const buffer = "0xdeadbeef";
      const fromAddress = mockCactusGetEthereumAccountsResponse[0].address;

      const result = await cactusCustodianApi.signPersonalMessage(fromAddress, buffer);

      expect(result).toEqual({
        from: fromAddress,
        transactionStatus: mockCactusCreateSignatureResponse.transactionStatus,
        custodian_transactionId: mockCactusCreateSignatureResponse.custodian_transactionId,
      });

      expect(mockedCactusClientInstance.signPersonalMessage).toHaveBeenCalledWith(
        mockCactusGetEthereumAccountsResponse[0].address,
        buffer,
      );
    });
  });

  describe("CactusCustodianApi#signTypedData_v4", () => {
    it("calls client.signTypedData_v4", async () => {
      const fromAddress = mockCactusGetEthereumAccountsResponse[0].address;

      const buffer: TypedMessage<MessageTypes> = {
        types: {
          EIP712Domain: [],
        },
        primaryType: "test",
        domain: {
          chainId: 4,
          name: "test",
        },
        message: {},
      };

      const result = await cactusCustodianApi.signTypedData_v4(fromAddress, buffer, "V4");

      expect(result).toEqual({
        from: fromAddress,
        transactionStatus: mockCactusCreateSignatureResponse.transactionStatus,
        custodian_transactionId: mockCactusCreateSignatureResponse.custodian_transactionId,
      });

      expect(mockedCactusClientInstance.signTypedData_v4).toHaveBeenCalledWith(
        mockCactusGetEthereumAccountsResponse[0].address,
        buffer,
        "V4",
        4,
      );
    });
  });

  describe("CactusCustodianApi#getCustomerProof", () => {
    it("calls getCustomerProof on the client and returns the token", async () => {
      const result = await cactusCustodianApi.getCustomerProof();

      expect(result).toEqual(mockCactusGetCustomerProofResponse.jwt);

      expect(mockedCactusClientInstance.getCustomerProof).toHaveBeenCalled();
    });
  });

  describe("CactusCustodianApi#getErc20Tokens", () => {
    it("returns an empty object", async () => {
      const result = await cactusCustodianApi.getErc20Tokens();

      expect(result).toEqual({});
    });
  });

  describe("CactusCustodianApi#getTransactionLink", () => {
    it("resolves to null", async () => {
      const result = await cactusCustodianApi.getTransactionLink("xxx");

      expect(result).toEqual(null);
    });
  });

  describe("QredoCustodianApi#getSupportedChains", () => {
    it("calls the client and returns the networks as strings", async () => {
      const result = await cactusCustodianApi.getSupportedChains();

      expect(mockedCactusClientInstance.getChainIds).toHaveBeenCalled();

      expect(result).toEqual(["42", "97", "80001", "10001"]);
    });
  });

  describe("CactusCustodianApi#getSignedMessage", () => {
    it("gets a single SignedMessage by id", async () => {
      const result: ISignatureDetails = await cactusCustodianApi.getSignedMessage(
        "0x",
        mockCactusGetSignedMessageResponse.custodian_transactionId,
      );

      expect(result).toEqual({
        id: result.id,
        signature: result.signature,
        status: result.status,
      });

      expect(mockedCactusClientInstance.getSignedMessage).toHaveBeenCalledWith(
        mockCactusGetSignedMessageResponse.custodian_transactionId,
      );
    });

    it("returns null if the client returns null", async () => {
      mockedCactusClientInstance.getSignedMessage = jest.fn().mockResolvedValueOnce(null);

      const result: ISignatureDetails = await cactusCustodianApi.getSignedMessage(
        "0x",
        mockCactusGetSignedMessageResponse.custodian_transactionId,
      );

      expect(result).toEqual(null);
    });
  });
});
