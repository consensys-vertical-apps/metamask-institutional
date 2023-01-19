import { QredoClient } from "./QredoClient";
import { mocked } from "ts-jest/utils";

jest.mock("./QredoClient");

jest.mock("../../util/get-token-issuer", () => ({
  getTokenIssuer: jest.fn().mockReturnValue("some_website"),
}));

import { QredoCustodianApi } from "./QredoCustodianApi";
import { MessageTypes, TypedMessage } from "../../interfaces/ITypedMessage";
import { qredoTransactionMock } from "./mocks/qredoTransactionMock";
import { qredoAccountsMock } from "./mocks/qredoAccountsMock";
import { qredoCustomerProofMock } from "./mocks/qredoCustomerProofMock";
import { qredoNetworksMock } from "./mocks/qredoNetworksMock";
import { qredoSignedMessageMock } from "./mocks/qredoSignedMessageMock";
import { qredoPersonalSignResponseMock } from "./mocks/qredoPersonalSignResponseMock";
import { qredoEIP712SignRequestMock } from "./mocks/qredoEIP712SignRequestMock";
import { AuthTypes, ISignatureDetails, ITransactionDetails } from "@metamask-institutional/types";

describe("QredoCustodianApi", () => {
  let qredoCustodianApi: QredoCustodianApi;
  const mockedQredoClient = mocked(QredoClient, true);
  let mockedQredoClientInstance;

  const mockRefreshToken = "mock-refresh-token";
  const mockUrl = "http://mock-url";

  beforeEach(() => {
    qredoCustodianApi = new QredoCustodianApi({ refreshToken: mockRefreshToken }, AuthTypes.TOKEN, mockUrl, 0);

    mockedQredoClientInstance = mockedQredoClient.mock.instances[0];
    mockedQredoClientInstance.getEthereumAccounts = jest.fn().mockImplementation(() => qredoAccountsMock);

    mockedQredoClientInstance.getTransactions = jest.fn().mockImplementation(() => [qredoTransactionMock]);

    mockedQredoClientInstance.getTransaction = jest.fn().mockImplementation(() => qredoTransactionMock);

    mockedQredoClientInstance.createTransaction = jest.fn().mockImplementation(() => qredoTransactionMock);

    mockedQredoClientInstance.getCustomerProof = jest.fn().mockImplementation(() => qredoCustomerProofMock);

    mockedQredoClientInstance.getSignedMessage = jest.fn().mockImplementation(() => qredoSignedMessageMock);

    mockedQredoClientInstance.getNetworks = jest.fn().mockImplementation(() => qredoNetworksMock);

    mockedQredoClientInstance.signPersonalMessage = jest.fn().mockImplementation(() => qredoPersonalSignResponseMock);

    mockedQredoClientInstance.signTypedData_v4 = jest.fn().mockImplementation(() => qredoPersonalSignResponseMock);

    mockedQredoClient.mockClear();
  });

  describe("QredoCustodianApi#getAccountHierarchy", () => {
    it("does nothing", async () => {
      const result = await qredoCustodianApi.getAccountHierarchy();

      expect(result).toEqual(null);
    });
  });

  describe("QredoCustodianApi#getEthereumAccounts", () => {
    it("returns the accounts", async () => {
      const result = await qredoCustodianApi.getEthereumAccounts();
      expect(mockedQredoClientInstance.getEthereumAccounts).toHaveBeenCalled();

      expect(result).toEqual(
        qredoAccountsMock.map(account => ({
          name: account.labels[1].value,
          address: account.address,
          balance: null,
          custodianDetails: {
            accountId: account.walletID,
          },
          chainId: qredoCustodianApi.networkMappings.getMappingByCustodianName(account.network).chainId,
          labels: account.labels
            .filter(label => label.key !== "wallet-name")
            .map(label => ({
              key: label.name,
              value: label.value,
            })),
        })),
      );
    });
  });

  describe("QredoCustodianApi#getEthereumAccountsByAddress", () => {
    it("fetches the ethereum accounts for a given address", async () => {
      const result = await qredoCustodianApi.getEthereumAccountsByAddress("0xb");

      expect(result.length).toBe(qredoAccountsMock.filter(acc => acc.address.startsWith("0xb")).length);
    });
  });

  describe("QredoCustodianApi#getEthereumAccountsByLabelOrAddressName", () => {
    it("fetches the ethereum accounts based on label or address name", async () => {
      const result = await qredoCustodianApi.getEthereumAccountsByLabelOrAddressName("Amazing");

      expect(result.length).toBe(qredoAccountsMock.filter(acc => acc.labels[1].value.includes("Amazing")).length);
    });
  });

  describe("QredoCustodianApi#getSignedMessage", () => {
    it("gets a single SignedMessage by id", async () => {
      const result: ISignatureDetails = await qredoCustodianApi.getSignedMessage("0x", qredoSignedMessageMock.sigID);

      expect(result).toEqual({
        id: result.id,
        signature: result.signature,
        status: result.status,
      });

      expect(mockedQredoClientInstance.getSignedMessage).toHaveBeenCalledWith(qredoSignedMessageMock.sigID);
    });
  });

  describe("QredoCustodianApi#createTransaction", () => {
    it("finds the account, then calls client.createTransaction", async () => {
      const fromAddress = qredoAccountsMock[0].address;
      const txParams = {
        from: fromAddress,
        to: "to",
        value: "1",
        gasPrice: "1",
        gasLimit: "1", // No data
      };

      await qredoCustodianApi.createTransaction(txParams, { chainId: "42" });

      expect(mockedQredoClientInstance.createTransaction).toHaveBeenCalledWith(
        {
          from: qredoAccountsMock[0].address,
          chainId: "42",
        },
        txParams,
      );
    });
  });

  describe("QredoCustodianApi#getTransaction", () => {
    it("gets a single transaction by id", async () => {
      const result: ITransactionDetails = await qredoCustodianApi.getTransaction("0x", qredoTransactionMock.txID);

      expect(result).toEqual({
        transactionHash: qredoTransactionMock.txHash,
        transactionStatus: qredoTransactionMock.status,
        custodian_transactionId: qredoTransactionMock.txID,
        from: null,
        gasPrice: qredoTransactionMock.gasPrice,
        gasLimit: qredoTransactionMock.gasLimit,
        nonce: qredoTransactionMock.nonce.toString(10),
        maxFeePerGas: null,
        maxPriorityFeePerGas: null,
      });

      expect(mockedQredoClientInstance.getTransaction).toHaveBeenCalledWith(qredoTransactionMock.txID);
    });

    describe("QredoCustodianApi#getCustomerId", () => {
      it("should call getOrganizations and return the id of the first organization that is returned", async () => {
        const result = await qredoCustodianApi.getCustomerId();
        expect(result).toEqual("qredo-customer");
      });
    });

    describe("QredoCustodianApi#getAllTransactions", () => {
      it("should call getTransactions for the customer corresponding to the first organization", async () => {
        await qredoCustodianApi.getAllTransactions();
        expect(mockedQredoClientInstance.getTransactions).toHaveBeenCalled();
      });
    });

    describe("QredoCustodianApi#signPersonalMessage", () => {
      it("throws an error", async () => {
        const buffer = "0xdeadbeef";
        const fromAddress = qredoAccountsMock[0].address;

        const result = await qredoCustodianApi.signPersonalMessage(fromAddress, buffer);

        expect(result).toEqual({
          from: fromAddress,
          transactionStatus: qredoPersonalSignResponseMock.status,
          custodian_transactionId: qredoPersonalSignResponseMock.sigID,
        });

        expect(mockedQredoClientInstance.signPersonalMessage).toHaveBeenCalledWith(
          qredoAccountsMock[0].address,
          buffer,
        );
      });
    });

    describe("QredoCustodianApi#signTypedData_v4", () => {
      it("calls client.signTypedData_v4", async () => {
        const fromAddress = qredoAccountsMock[0].address;

        // @ts-ignore
        const buffer: TypedMessage<MessageTypes> = qredoEIP712SignRequestMock.payload;

        const result = await qredoCustodianApi.signTypedData_v4(fromAddress, buffer, "V4");

        expect(result).toEqual({
          from: fromAddress,
          transactionStatus: qredoPersonalSignResponseMock.status,
          custodian_transactionId: qredoPersonalSignResponseMock.sigID,
        });

        expect(mockedQredoClientInstance.signTypedData_v4).toHaveBeenCalledWith(fromAddress, buffer);
      });
    });
    describe("QredoCustodianApi#getCustomerProof", () => {
      it("calls getCustomerProof on the client and returns the token", async () => {
        const result = await qredoCustodianApi.getCustomerProof();

        expect(result).toEqual(qredoCustomerProofMock.jwt);

        expect(mockedQredoClientInstance.getCustomerProof).toHaveBeenCalled();
      });
    });

    describe("QredoCustodianApi#getErc20Tokens", () => {
      it("returns an empty object", async () => {
        const result = await qredoCustodianApi.getErc20Tokens();

        expect(result).toEqual({});
      });
    });

    describe("QredoCustodianApi#getTransactionLink", () => {
      it("resolves to null", async () => {
        const result = await qredoCustodianApi.getTransactionLink("xxx");

        expect(result).toEqual(null);
      });
    });

    describe("QredoCustodianApi#getSupportedChains", () => {
      it("calls the client and returns the networks as strings", async () => {
        const result = await qredoCustodianApi.getSupportedChains();

        expect(mockedQredoClientInstance.getNetworks).toHaveBeenCalled();

        expect(result).toEqual(["42"]);
      });
    });
  });
});
