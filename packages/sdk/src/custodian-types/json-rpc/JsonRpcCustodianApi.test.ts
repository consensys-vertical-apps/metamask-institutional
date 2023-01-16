import { mocked } from "ts-jest/utils";

jest.mock("./JsonRpcClient");

jest.mock("../../util/get-token-issuer", () => ({
  getTokenIssuer: jest.fn().mockReturnValue("some_website"),
}));

import { AuthTypes } from "../../enum/AuthTypes";
import { JsonRpcCustodianApi } from "./JsonRpcCustodianApi";
import { JsonRpcClient } from "./JsonRpcClient";
import { mockJsonRpcListAccountResponse } from "./mocks/mockJsonRpcListAccountResponse";
import { mockJsonRpcCreateTransactionResponse } from "./mocks/mockJsonRpcCreateTransactionResponse";
import { IEIP1559TxParams, ILegacyTXParams } from "../../interfaces/ITXParams";
import { hexlify } from "./util/hexlify";
import { mockJsonRpcGetTransactionByIdPayload } from "./mocks/mockJsonRpcGetTransactionByIdPayload";
import { mockJsonRpcGetTransactionByIdResponse } from "./mocks/mockJsonRpcGetTransactionByIdResponse";
import { mapStatusObjectToStatusText } from "./util/mapStatusObjectToStatusText";
import { mockJsonRpcGetCustomerProofResponse } from "./mocks/mockJsonRpcGetCustomerProofResponse";
import { mockJsonRpcSignTypedDataPayload } from "./mocks/mockJsonRpcSignTypedDataPayload";
import { mockJsonRpcSignTypedDataResponse } from "./mocks/mockJsonRpcSignTypedDataResponse";
import { mockJsonRpcSignPayload } from "./mocks/mockJsonRpcSignPayload";
import { mockJsonRpcSignResponse } from "./mocks/mockJsonRpcSignResponse";
import { mockJsonRpcListAccountChainIdsResponse } from "./mocks/mockJsonRpcListAccountChainIdsResponse";
import { mockJsonRpcGetTransactionLinkResponse } from "./mocks/mockJsonRpcGetTransactionLinkResponse";
import { mockJsonRpcGetTransactionLinkPayload } from "./mocks/mockJsonRpcGetTransactionLinkPayload";

describe("JsonRpcCustodianApi", () => {
  let jsonRpcCustodianApi: JsonRpcCustodianApi;
  const mockedJsonRpcClient = mocked(JsonRpcClient, true);
  let mockedJsonRpcClientInstance;

  const mockJwt = "mock-jwt";
  const mockUrl = "http://mock-url";

  const fromAddress = mockJsonRpcListAccountResponse.result[0].address;

  beforeEach(() => {
    jsonRpcCustodianApi = new JsonRpcCustodianApi(
      { refreshToken: mockJwt },
      AuthTypes.TOKEN,
      mockUrl,
      0
    );

    mockedJsonRpcClientInstance = mockedJsonRpcClient.mock.instances[0];
    mockedJsonRpcClientInstance.listAccounts = jest
      .fn()
      .mockImplementation(() => mockJsonRpcListAccountResponse);

    mockedJsonRpcClientInstance.createTransaction = jest
      .fn()
      .mockImplementation(() => mockJsonRpcCreateTransactionResponse);

    mockedJsonRpcClientInstance.getTransaction = jest
      .fn()
      .mockImplementation(() => mockJsonRpcGetTransactionByIdResponse);

    mockedJsonRpcClientInstance.getTransactionLink = jest
      .fn()
      .mockImplementation(() => mockJsonRpcGetTransactionLinkResponse);

    mockedJsonRpcClientInstance.getCustomerProof = jest
      .fn()
      .mockImplementation(() => mockJsonRpcGetCustomerProofResponse);

    mockedJsonRpcClientInstance.signTypedData = jest
      .fn()
      .mockImplementation(() => mockJsonRpcSignTypedDataResponse);

    mockedJsonRpcClientInstance.signPersonalMessage = jest
      .fn()
      .mockImplementation(() => mockJsonRpcSignResponse);

    mockedJsonRpcClientInstance.getAccountChainIds = jest
      .fn()
      .mockImplementation(() => mockJsonRpcListAccountChainIdsResponse);

    mockedJsonRpcClientInstance.on = jest
      .fn()
      .mockImplementation(() => mockJsonRpcListAccountChainIdsResponse);

    mockedJsonRpcClient.mockClear();
  });

  describe("getAccountHierarchy", () => {
    it("does nothing", async () => {
      const result = await jsonRpcCustodianApi.getAccountHierarchy();

      expect(result).toEqual(null);
    });
  });

  describe("getEthereumAccounts", () => {
    it("returns the accounts", async () => {
      const result = await jsonRpcCustodianApi.getEthereumAccounts();
      expect(mockedJsonRpcClientInstance.listAccounts).toHaveBeenCalled();

      expect(result).toEqual(
        mockJsonRpcListAccountResponse.result.map((account) => ({
          name: account.name,
          address: account.address,
          custodianDetails: null,
          labels: account.tags.map((tag) => ({
            key: tag.name,
            value: tag.value,
          })),
        }))
      );
    });
  });

  describe("getEthereumAccountByAddress", () => {
    it("gets the accounts, and then filters by address", async () => {
      const result = await jsonRpcCustodianApi.getEthereumAccountsByAddress(
        fromAddress
      );

      expect(mockedJsonRpcClientInstance.listAccounts).toHaveBeenCalled();

      expect(result).toEqual(
        mockJsonRpcListAccountResponse.result
          .map((account) => ({
            name: account.name,
            address: account.address,
            custodianDetails: null,
            labels: account.tags.map((tag) => ({
              key: tag.name,
              value: tag.value,
            })),
          }))
          .filter((account) => account.address === fromAddress)
      );
    });
  });

  describe("getEthereumAccountsByLabelOrAddressName", () => {
    it("gets the accounts, and then filters by account name", async () => {
      const result = await jsonRpcCustodianApi.getEthereumAccountsByLabelOrAddressName(
        "Elegantly Jittery Viper Fish"
      );

      expect(result).toEqual(
        mockJsonRpcListAccountResponse.result
          .map((account) => ({
            name: account.name,
            address: account.address,
            custodianDetails: null,
            labels: account.tags.map((tag) => ({
              key: tag.name,
              value: tag.value,
            })),
          }))
          .filter((account) => account.name === "Elegantly Jittery Viper Fish")
      );
    });
  });

  describe("createTransaction", () => {
    it("calls create transaction on the client (EIP-1559)", async () => {
      const txParams: IEIP1559TxParams = {
        from: fromAddress,
        to: "to",
        value: "1",
        gasLimit: "1", // No data
        type: "2",
        maxFeePerGas: "10",
        maxPriorityFeePerGas: "20",
      };

      const result = await jsonRpcCustodianApi.createTransaction(txParams, {
        chainId: "4",
        note: "note",
      });

      expect(
        mockedJsonRpcClientInstance.createTransaction
      ).toHaveBeenCalledWith([
        {
          from: fromAddress,
          to: txParams.to,
          gas: hexlify(txParams.gasLimit),
          value: hexlify(txParams.value),
          data: undefined,
          maxFeePerGas: hexlify(txParams.maxFeePerGas),
          maxPriorityFeePerGas: hexlify(txParams.maxPriorityFeePerGas),
          type: hexlify(txParams.type),
        },
        { chainId: "0x4", note: "note" },
      ]);

      expect(result).toEqual({
        custodian_transactionId: mockJsonRpcCreateTransactionResponse.result,
        transactionStatus: "created",
        from: fromAddress,
      });
    });

    it("calls create transaction on the client (Legacy)", async () => {
      const txParams: ILegacyTXParams = {
        from: fromAddress,
        to: "to",
        value: "1",
        gasLimit: "1", // No data
        type: "0",
        gasPrice: "10",
      };

      const result = await jsonRpcCustodianApi.createTransaction(txParams, {
        chainId: "4",
        note: "note",
      });

      expect(
        mockedJsonRpcClientInstance.createTransaction
      ).toHaveBeenCalledWith([
        {
          from: fromAddress,
          to: txParams.to,
          gas: hexlify(txParams.gasLimit),
          value: hexlify(txParams.value),
          data: undefined,
          gasPrice: hexlify(txParams.gasPrice),
          type: hexlify(txParams.type),
        },
        { chainId: "0x4", note: "note" },
      ]);

      expect(result).toEqual({
        custodian_transactionId: mockJsonRpcCreateTransactionResponse.result,
        transactionStatus: "created",
        from: fromAddress,
      });
    });

    it("throws an error if the address does not exist", async () => {
      const txParams: ILegacyTXParams = {
        from: "0xfakeaddress",
        to: "to",
        value: "1",
        gasLimit: "1", // No data
        type: "0",
        gasPrice: "10",
      };

      await expect(
        jsonRpcCustodianApi.createTransaction(txParams, {
          chainId: "4",
        })
      ).rejects.toThrowError("No such ethereum account");
    });
  });

  describe("getTransaction", () => {
    it("calls getTransaction on the client", async () => {
      const result = await jsonRpcCustodianApi.getTransaction(
        null,
        mockJsonRpcGetTransactionByIdPayload[0]
      );

      expect(mockedJsonRpcClientInstance.getTransaction).toHaveBeenCalledWith(
        mockJsonRpcGetTransactionByIdPayload
      );

      expect(result).toEqual({
        custodian_transactionId:
          mockJsonRpcGetTransactionByIdResponse.result.id,
        transactionStatus: mapStatusObjectToStatusText(
          mockJsonRpcGetTransactionByIdResponse.result.status
        ),
        transactionStatusDisplayText:
          mockJsonRpcGetTransactionByIdResponse.result.status.displayText,
        from: mockJsonRpcGetTransactionByIdResponse.result.from,
        gasLimit: mockJsonRpcGetTransactionByIdResponse.result.gas,
        gasPrice: mockJsonRpcGetTransactionByIdResponse.result.gasPrice,
        maxFeePerGas: mockJsonRpcGetTransactionByIdResponse.result.maxFeePerGas,
        maxPriorityFeePerGas:
          mockJsonRpcGetTransactionByIdResponse.result.maxPriorityFeePerGas,
        nonce: mockJsonRpcGetTransactionByIdResponse.result.nonce,
        transactionHash: mockJsonRpcGetTransactionByIdResponse.result.hash,
        reason: null,
        to: mockJsonRpcGetTransactionByIdResponse.result.to,
      });
    });

    it("will return null if there is no such transaction", async () => {
      mockedJsonRpcClientInstance.getTransaction.mockReturnValueOnce({
        result: null,
      });
      const result = await jsonRpcCustodianApi.getTransaction(null, "fake");

      expect(result).toEqual(null);
    });
  });

  describe("getAllTransactions", () => {
    it("should return null", async () => {
      const result = await jsonRpcCustodianApi.getAllTransactions();
      expect(result).toBeNull();
    });
  });
  describe("getCustomerId", () => {
    it("should return null", async () => {
      const result = await jsonRpcCustodianApi.getCustomerId();
      expect(result).toBeNull();
    });
  });

  describe("getCustomerProof", () => {
    it("should call getCustomerProof on the client", async () => {
      const result = await jsonRpcCustodianApi.getCustomerProof();
      expect(result).toEqual(mockJsonRpcGetCustomerProofResponse.result.jwt);
    });
  });

  describe("signTypedData_v4", () => {
    it("should call signTypedData on the client", async () => {
      const result = await jsonRpcCustodianApi.signTypedData_v4(
        mockJsonRpcSignTypedDataPayload[0],
        mockJsonRpcSignTypedDataPayload[1],
        mockJsonRpcSignTypedDataPayload[2]
      );

      expect(mockedJsonRpcClientInstance.signTypedData).toHaveBeenCalledWith(
        mockJsonRpcSignTypedDataPayload
      );

      expect(result).toEqual({
        custodian_transactionId: mockJsonRpcSignTypedDataResponse.result,
        transactionStatus: "created",
        from: mockJsonRpcSignTypedDataPayload[0],
      });
    });

    it("should throw an error if the address does not exist", async () => {
      expect(
        jsonRpcCustodianApi.signTypedData_v4(
          "fake",
          mockJsonRpcSignTypedDataPayload[1],
          mockJsonRpcSignTypedDataPayload[2]
        )
      ).rejects.toThrowError("No such ethereum account");
    });
  });

  describe("signPersonalMessage", () => {
    it("should call signPersonalMessage on the client", async () => {
      const result = await jsonRpcCustodianApi.signPersonalMessage(
        mockJsonRpcSignPayload[0],
        mockJsonRpcSignPayload[1]
      );

      expect(
        mockedJsonRpcClientInstance.signPersonalMessage
      ).toHaveBeenCalledWith(mockJsonRpcSignPayload);

      expect(result).toEqual({
        custodian_transactionId: mockJsonRpcSignResponse.result,
        transactionStatus: "created",
        from: mockJsonRpcSignTypedDataPayload[0],
      });
    });

    it("should throw an error if the address does not exist", async () => {
      expect(
        jsonRpcCustodianApi.signPersonalMessage(
          "fake",
          mockJsonRpcSignPayload[1]
        )
      ).rejects.toThrowError("No such ethereum account");
    });
  });

  describe("getErc20Tokens", () => {
    it("should return an empty object", async () => {
      const result = await jsonRpcCustodianApi.getErc20Tokens();
      expect(result).toEqual({});
    });
  });

  describe("getSupportedChains", () => {
    it("should call getAccountChainIds on the client", async () => {
      const result = await jsonRpcCustodianApi.getSupportedChains("0xtest");

      expect(
        mockedJsonRpcClientInstance.getAccountChainIds
      ).toHaveBeenCalledWith(["0xtest"]);

      expect(result).toEqual(mockJsonRpcListAccountChainIdsResponse.result);
    });
  });

  describe("getTransactionLink", () => {
    it("should call getTransactionLink on the client", async () => {
      const result = await jsonRpcCustodianApi.getTransactionLink(
        mockJsonRpcGetTransactionLinkPayload[0]
      );

      expect(
        mockedJsonRpcClientInstance.getTransactionLink
      ).toHaveBeenCalledWith(mockJsonRpcGetTransactionLinkPayload);

      expect(result).toEqual({
        url: mockJsonRpcGetTransactionLinkResponse.result.url,
        action: mockJsonRpcGetTransactionLinkResponse.result.action,
        text: mockJsonRpcGetTransactionLinkResponse.result.text,
        ethereum: mockJsonRpcGetTransactionLinkResponse.result.ethereum,
      });
    });
  });
});
