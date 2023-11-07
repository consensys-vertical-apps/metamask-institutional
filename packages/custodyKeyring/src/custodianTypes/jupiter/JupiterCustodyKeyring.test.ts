import { Transaction } from "@ethereumjs/tx";
import { JupiterCustodianApi, MMISDK, mmiSDKFactory } from "@metamask-institutional/sdk";
import {
  ICustodianAccount,
  IEIP1559TxParams,
  IExtensionCustodianAccount,
  ILegacyTXParams,
  ITokenAuthDetails,
  MetamaskTransaction,
} from "@metamask-institutional/types";
import { mocked } from "ts-jest/utils";

import { DEFAULT_MAX_CACHE_AGE } from "../../constants";
import { JupiterCustodyKeyring } from "./JupiterCustodyKeyring";
import { JupiterStatusMap } from "./JupiterStatusMap";

jest.mock("@metamask-institutional/sdk");

const mockedMmiSdkFactory = mocked(mmiSDKFactory, true);
const mockAccounts = [
  {
    name: "myCoolAccount",
    address: "0x123456",
    custodianDetails: {},
    labels: [{ key: "my-label", value: "my-label" }],
    token: "jwt",
    apiUrl: "apiUrl",
  },
];

const mockMMISDK = {
  getAccountHierarchy: jest.fn(),
  getEthereumAccounts: jest.fn().mockResolvedValue(mockAccounts),
  getEthereumAccountsByAddress: jest.fn().mockResolvedValue(mockAccounts),
  getEthereumAccountsByLabelOrAddressName: jest.fn().mockResolvedValue([]),
  createTransaction: jest.fn(),
  getTransaction: jest.fn(),
  getAllTransactions: jest.fn(),
  getCustomerId: jest.fn(),
  signedTypedData_v4: jest.fn(),
  signPersonalMessage: jest.fn(),
  getErc20Tokens: jest.fn(),
  subscribeToEvents: jest.fn(),
  registerEventCallback: jest.fn(),
  handlePing: jest.fn(),
  checkPing: jest.fn(),
  handleEvent: jest.fn(),
  setBuildMetaData: jest.fn(),
  getTransactionLink: jest.fn().mockResolvedValue(null),
  changeRefreshTokenAuthDetails: jest.fn(),
  eventCallbacks: [],
  jwt: "",
  defaultCacheAgeSeconds: 0,
  lastPing: 0,
  pingCheckRunning: false,
  cache: null,
  custodianApi: null,
  getSupportedChains: jest.fn().mockReturnValue(["4"]),
  on: jest.fn(),
};

describe("CustodyKeyring", () => {
  let custodyKeyring: JupiterCustodyKeyring;

  beforeEach(() => {
    custodyKeyring = new JupiterCustodyKeyring();
    jest.clearAllMocks();
    mockedMmiSdkFactory.mockReturnValue(mockMMISDK as unknown as MMISDK);
  });

  describe("serialize", () => {
    it("should return the accounts, selectedAddresses, accountDetails and meta as plain objects", async () => {
      const result = await custodyKeyring.serialize();
      expect(result).toEqual({
        accounts: [],
        selectedAddresses: [],
        accountsDetails: [],
        meta: {},
      });
    });
  });

  describe("deserialize", () => {
    it("should accept the accounts, selectedAddresses and accountDetails and self assign them, including creating SDKs for them", async () => {
      const mockAccounts = ["0x123456"];
      const mockSelectedAddresses: ICustodianAccount<ITokenAuthDetails>[] = [
        {
          name: "myCoolAccount",
          address: "0x123456",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          authDetails: { jwt: "jwt" },
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];
      const mockAccountsDetails: ICustodianAccount<ITokenAuthDetails>[] = [
        {
          address: "0x123456",
          authDetails: { jwt: "jwt" },
          apiUrl: "apiUrl",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          custodyType: "jupiter",
        },
      ];

      await custodyKeyring.deserialize({
        accounts: mockAccounts,
        selectedAddresses: mockSelectedAddresses,
        accountsDetails: mockAccountsDetails,
      });

      expect(custodyKeyring.accounts).toEqual(mockAccounts);
      expect(custodyKeyring.selectedAddresses).toEqual(mockSelectedAddresses);
      expect(custodyKeyring.accountsDetails).toEqual(mockAccountsDetails);
      expect(mmiSDKFactory).toHaveBeenCalled();
    });
  });

  describe("setSelectedAddresses", () => {
    it("accepts an array of custodian accounts and self assigns them", () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount",
          address: "0x123456",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];

      expect(custodyKeyring.selectedAddresses).toEqual([]);
      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);
      expect(custodyKeyring.selectedAddresses).toEqual(
        mockSelectedAddresses.map(
          custodyKeyring.convertExtensionCustodianAccountToSDKCustodianAccount.bind(custodyKeyring),
        ),
      );
    });
  });

  describe("addAccounts", () => {
    it("takes a number, and adds this many accounts from selectedAddresses to the accounts list and stores their metadata in accountsDetails", () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123456",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
        {
          name: "myCoolAccount2",
          address: "0x123457",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);
      custodyKeyring.addAccounts(1);
      expect(custodyKeyring.accounts.length).toEqual(1);
      custodyKeyring.addAccounts(2);
      expect(custodyKeyring.accounts.length).toEqual(2);
    });
  });

  describe("getAccounts", () => {
    it("returns the accounts property", async () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123456",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];
      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);
      custodyKeyring.addAccounts(1);
      const result = await custodyKeyring.getAccounts();
      expect(result).toEqual(custodyKeyring.accounts);
    });
  });

  describe("removeAccounts", () => {
    it("removes an account from the accounts list based on the address", () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123456",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
        {
          name: "myCoolAccount2",
          address: "0x123457",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];
      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);
      custodyKeyring.addAccounts(2);

      expect(custodyKeyring.accounts.length).toEqual(2);
      expect(custodyKeyring.accountsDetails.length).toEqual(2);

      custodyKeyring.removeAccount(mockSelectedAddresses[1].address);

      expect(custodyKeyring.accounts.length).toEqual(1);
      expect(custodyKeyring.accountsDetails.length).toEqual(1);

      custodyKeyring.removeAccount(mockSelectedAddresses[0].address);

      expect(custodyKeyring.accounts.length).toEqual(0);
      expect(custodyKeyring.accountsDetails.length).toEqual(0);
    });
  });

  describe("getSDK", () => {
    it("returns a copy of the SDK from the sdkList if it exists, or creates one if it is not there", () => {
      const result = custodyKeyring.getSDK({ jwt: "jwt" }, "apiUrl");

      expect(result).toEqual(mockMMISDK);

      expect(mockedMmiSdkFactory).toHaveBeenCalledWith(JupiterCustodianApi, { jwt: "jwt" }, 0, "apiUrl");
    });

    it("does not create one of it is there already", () => {
      custodyKeyring.getSDK({ jwt: "jwt" }, "apiUrl");
      custodyKeyring.getSDK({ jwt: "jwt" }, "apiUrl");

      expect(mmiSDKFactory).toHaveBeenCalledTimes(1);
    });

    it("will draw from the existing sdkList and return only ones that differ by hash of the auth details", () => {
      custodyKeyring.getSDK({ jwt: "jwt" }, "apiUrl");
      custodyKeyring.getSDK({ jwt: "jwt" }, "apiUrl");
      custodyKeyring.getSDK({ jwt: "jwt2" }, "apiUrl");

      expect(mmiSDKFactory).toHaveBeenCalledTimes(2);
    });
  });

  describe("getCustodianAccounts", () => {
    it("will get addresses, if the arguments specify an ethereum address", () => {
      const address = "0x4D8519890C77217A352d3cC978B0b74165154401";

      custodyKeyring.getCustodianAccounts("jwt", "apiUrl", address);

      expect(mockMMISDK.getEthereumAccountsByAddress).toHaveBeenCalledWith(address, DEFAULT_MAX_CACHE_AGE);
    });

    it("will not return already existing addresses", async () => {
      const address = "0x4D8519890C77217A352d3cC978B0b74165154401";

      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address,
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);

      custodyKeyring.addAccounts(1);

      const result = await custodyKeyring.getCustodianAccounts("jwt", "apiUrl", address);
      expect(result).toEqual(mockAccounts);
      expect(mmiSDKFactory).toHaveBeenCalledTimes(1);
    });

    it("will search by labels if there is a non-address search text", () => {
      custodyKeyring.getCustodianAccounts("jwt", "apiUrl", "search");

      expect(mockMMISDK.getEthereumAccountsByLabelOrAddressName).toHaveBeenCalledWith("search", DEFAULT_MAX_CACHE_AGE);
    });

    it("will get all accounts (for a chainID) if called with no search text", () => {
      custodyKeyring.getCustodianAccounts("jwt", "apirUrl", null);

      expect(mockMMISDK.getEthereumAccounts).toHaveBeenCalledWith(60);
    });
  });

  describe("getTransactionNote", () => {
    it("will get a readable category for transaction based on the transaction category", () => {
      const txMeta = {
        type: "transfer",
        origin: "http://",
      } as MetamaskTransaction;

      expect(custodyKeyring.getTransactionNote(txMeta)).toEqual("ETH Transfer - initiated on http://");
    });

    it("will return the raw category if there is no mapping", () => {
      const txMeta = {
        type: "blah",
        origin: "http://",
      } as MetamaskTransaction;

      expect(custodyKeyring.getTransactionNote(txMeta)).toEqual("blah - initiated on http://");
    });
  });

  describe("signTransaction", () => {
    it("will get account information and then call signTransaction on the SDK with formatted transaction metadata", async () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123458",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);

      custodyKeyring.addAccounts(1);

      const fromAddress = mockSelectedAddresses[0].address;

      const ethTx = {
        data: "0x",
      } as unknown as Transaction;

      const txMeta = {
        type: "contractInteraction",
        origin: "http://",
        chainId: "4",
        txParams: {
          to: "0x5678",
          gasPrice: "1",
          gas: "2",
          value: "3",
        },
      } as MetamaskTransaction;

      await custodyKeyring.signTransaction(fromAddress, ethTx, txMeta);

      expect(mockMMISDK.createTransaction).toHaveBeenCalledWith(
        {
          data: ethTx.data,
          from: fromAddress,
          gasLimit: txMeta.txParams.gas,
          gasPrice: (txMeta.txParams as ILegacyTXParams).gasPrice,
          to: txMeta.txParams.to,
          value: txMeta.txParams.value,
          type: "0",
        },
        {
          chainId: txMeta.chainId,
          note: "Contract Interaction - initiated on http://",
          origin: "http://",
          transactionCategory: "contractInteraction",
        },
      );
    });

    it("will throw if there's a specified chainId and it doesnt match the account", async () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123458",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);

      custodyKeyring.addAccounts(1);

      const fromAddress = mockSelectedAddresses[0].address;

      const ethTx = {
        data: "0x",
      } as unknown as Transaction;

      const txMeta = {
        type: "contractInteraction",
        origin: "http://",
        chainId: "777",
        txParams: {
          to: "0x5678",
          gasPrice: "1",
          gas: "2",
          value: "3",
        },
      } as unknown as MetamaskTransaction;

      await expect(custodyKeyring.signTransaction(fromAddress, ethTx, txMeta)).rejects.toThrowError(
        "This network 777 is not configured or supported by Jupiter",
      );
    });

    it("will call with type 2 for london transactions", async () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123458",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);

      custodyKeyring.addAccounts(1);

      const fromAddress = mockSelectedAddresses[0].address;

      const ethTx = {
        data: "0x",
      } as unknown as Transaction;

      const txMeta = {
        type: "contractInteraction",
        origin: "http://",
        chainId: "4",
        txParams: {
          to: "0x5678",
          gas: "2",
          maxFeePerGas: "4000000013",
          maxPriorityFeePerGas: "4000000000",
          value: "3",
        },
      } as MetamaskTransaction;

      await custodyKeyring.signTransaction(fromAddress, ethTx, txMeta);

      expect(mockMMISDK.createTransaction).toHaveBeenCalledWith(
        {
          data: ethTx.data,
          from: fromAddress,
          gasLimit: txMeta.txParams.gas,
          maxFeePerGas: (txMeta.txParams as IEIP1559TxParams).maxFeePerGas,
          maxPriorityFeePerGas: (txMeta.txParams as IEIP1559TxParams).maxPriorityFeePerGas,
          to: txMeta.txParams.to,
          value: txMeta.txParams.value,
          type: "2",
        },
        {
          chainId: txMeta.chainId,
          note: "Contract Interaction - initiated on http://",
          origin: "http://",
          transactionCategory: "contractInteraction",
        },
      );
    });

    it("handles large amounts", async () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123458",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);

      custodyKeyring.addAccounts(1);

      const fromAddress = mockSelectedAddresses[0].address;

      const ethTx = {
        data: "0x",
      } as unknown as Transaction;

      const txMeta = {
        type: "contractInteraction",
        origin: "http://",
        chainId: "4",
        txParams: {
          to: "0x5678",
          gasPrice: "1",
          gas: "2",
          value: "0xD3C21BCECCEDA1000000",
        },
      } as MetamaskTransaction;

      await custodyKeyring.signTransaction(fromAddress, ethTx, txMeta);

      expect(mockMMISDK.createTransaction).toHaveBeenCalledWith(
        {
          data: ethTx.data,
          from: fromAddress,
          gasLimit: (txMeta.txParams as ILegacyTXParams).gas,
          gasPrice: (txMeta.txParams as ILegacyTXParams).gasPrice,
          to: txMeta.txParams.to,
          value: "1000000000000000000000000",
          type: "0",
        },
        {
          chainId: txMeta.chainId,
          note: "Contract Interaction - initiated on http://",
          origin: "http://",
          transactionCategory: "contractInteraction",
        },
      );
    });

    it("should convert tx data from a Uint8Array to 0x-ified string", async () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123458",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);

      custodyKeyring.addAccounts(1);

      const fromAddress = mockSelectedAddresses[0].address;

      const ethTx = {
        data: Uint8Array.from([1]),
      } as unknown as Transaction;

      const txMeta = {
        type: "contractInteraction",
        origin: "http://",
        chainId: "4",
        txParams: {
          to: "0x5678",
          gasPrice: "1",
          gas: "2",
          value: "3",
          type: "0",
        },
      } as MetamaskTransaction;

      await custodyKeyring.signTransaction(fromAddress, ethTx, txMeta);

      expect(mockMMISDK.createTransaction).toHaveBeenCalledWith(
        {
          data: "0x1",
          from: fromAddress,
          gasLimit: txMeta.txParams.gas,
          gasPrice: (txMeta.txParams as ILegacyTXParams).gasPrice,
          to: txMeta.txParams.to,
          value: txMeta.txParams.value,
          type: txMeta.txParams.type,
        },
        {
          chainId: txMeta.chainId,
          note: "Contract Interaction - initiated on http://",
          origin: "http://",
          transactionCategory: "contractInteraction",
        },
      );
    });

    it("should convert empty data into undefined", async () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123458",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);

      custodyKeyring.addAccounts(1);

      const fromAddress = mockSelectedAddresses[0].address;

      const ethTx = {
        data: "",
      } as unknown as Transaction;

      const txMeta = {
        type: "contractInteraction",
        origin: "http://",
        chainId: "4",
        txParams: {
          to: "0x5678",
          gasPrice: "1",
          gas: "2",
          value: "3",
        },
      } as MetamaskTransaction;

      await custodyKeyring.signTransaction(fromAddress, ethTx, txMeta);

      expect(mockMMISDK.createTransaction).toHaveBeenCalledWith(
        {
          data: undefined,
          from: fromAddress,
          gasLimit: txMeta.txParams.gas,
          gasPrice: (txMeta.txParams as ILegacyTXParams).gasPrice,
          to: txMeta.txParams.to,
          value: txMeta.txParams.value,
          type: "0",
        },
        {
          chainId: txMeta.chainId,
          note: "Contract Interaction - initiated on http://",
          origin: "http://",
          transactionCategory: "contractInteraction",
        },
      );
    });

    it("should convert tx data from a Uint8Array to 0x-ified string", async () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123458",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);

      custodyKeyring.addAccounts(1);

      const fromAddress = mockSelectedAddresses[0].address;

      const ethTx = {
        data: Uint8Array.from([1]),
      } as unknown as Transaction;

      const txMeta = {
        type: "contractInteraction",
        origin: "http://",
        chainId: "4",
        txParams: {
          to: "0x5678",
          gasPrice: "1",
          gas: "2",
          value: "3",
        },
      } as MetamaskTransaction;

      await custodyKeyring.signTransaction(fromAddress, ethTx, txMeta);

      expect(mockMMISDK.createTransaction).toHaveBeenCalledWith(
        {
          data: "0x1",
          from: fromAddress,
          gasLimit: txMeta.txParams.gas,
          gasPrice: (txMeta.txParams as ILegacyTXParams).gasPrice,
          to: txMeta.txParams.to,
          value: txMeta.txParams.value,
          type: "0",
        },
        {
          chainId: txMeta.chainId,
          note: "Contract Interaction - initiated on http://",
          origin: "http://",
          transactionCategory: "contractInteraction",
        },
      );
    });

    it("should 0x-prefix data", async () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123458",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);

      custodyKeyring.addAccounts(1);

      const fromAddress = mockSelectedAddresses[0].address;

      const ethTx = {
        data: "12",
      } as unknown as Transaction;

      const txMeta = {
        type: "contractInteraction",
        origin: "http://",
        chainId: "4",
        txParams: {
          to: "0x5678",
          gasPrice: "1",
          gas: "2",
          value: "3",
          type: "0",
        },
      } as MetamaskTransaction;

      await custodyKeyring.signTransaction(fromAddress, ethTx, txMeta);

      expect(mockMMISDK.createTransaction).toHaveBeenCalledWith(
        {
          data: "0x12",
          from: fromAddress,
          gasLimit: txMeta.txParams.gas,
          gasPrice: (txMeta.txParams as ILegacyTXParams).gasPrice,
          to: txMeta.txParams.to,
          value: txMeta.txParams.value,
          type: txMeta.txParams.type,
        },
        {
          chainId: txMeta.chainId,
          note: "Contract Interaction - initiated on http://",
          origin: "http://",
          transactionCategory: "contractInteraction",
        },
      );
    });
  });

  describe("getTransaction", () => {
    it("should call getTransaction on the SDK", async () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123456",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);
      custodyKeyring.addAccounts(1);
      await custodyKeyring.getTransaction("0x123456", "12345");
      expect(mockMMISDK.getTransaction).toHaveBeenCalledWith("0x123456", "12345");
    });

    it("does nothing if called with bad arguments", async () => {
      const result = await custodyKeyring.getTransaction(undefined, undefined);

      expect(result).toEqual(null);
    });
  });

  describe("getTransactionDeepLink", () => {
    it("should return the URL of the Jupiter Custody UI", async () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123456",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);
      custodyKeyring.addAccounts(1);

      const result = await custodyKeyring.getTransactionDeepLink("0x123456", "12345");

      expect(result).toEqual({
        text: "Approve the transaction in the Jupiter Custody app. Once all required custody approvals have been performed the transaction will complete. Check your Jupiter Custody app for status.",
        url: null,
      });
    });

    it("should return a link to the Jupiter custody UI", async () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x1234567",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);
      custodyKeyring.addAccounts(1);

      const result = await custodyKeyring.getTransactionDeepLink("0x1234567", "12345");

      expect(result).toEqual({
        text: "Approve the transaction in the Jupiter Custody app. Once all required custody approvals have been performed the transaction will complete. Check your Jupiter Custody app for status.",
        url: null,
      });
    });

    it("has a special rule for the demo environment", async () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123456",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "https://jupiter-custody-demo.codefi.network",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);
      custodyKeyring.addAccounts(1);

      const result = await custodyKeyring.getTransactionDeepLink("0x123456", "12345");

      expect(result).toEqual({
        text: "Approve the transaction in the Jupiter Custody app. Once all required custody approvals have been performed the transaction will complete. Check your Jupiter Custody app for status.",
        url: "https://jupiter-custody-ui-demo.codefi.network/12345",
      });
    });
  });

  describe("signMessage", () => {
    it("should throw an exception", () => {
      expect(() => custodyKeyring.signMessage()).toThrowError("Not supported on this custodian");
    });
  });

  describe("exportAccount", () => {
    it("should throw an exception", () => {
      expect(() => custodyKeyring.exportAccount()).toThrowError("Not supported on this custodian");
    });
  });

  describe("getErc20Tokens", () => {
    it("should call getErc20Tokens for every jwt/URL pair", async () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123458",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
        {
          name: "myCoolAccount1",
          address: "0x123459",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt2",
          apiUrl: "apiUrl2",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);

      custodyKeyring.addAccounts(2);

      await custodyKeyring.getErc20Tokens();

      expect(mockMMISDK.getErc20Tokens).toHaveBeenCalledTimes(2);
    });
  });

  describe("getStatusMap", () => {
    it("should return the status map", () => {
      expect(custodyKeyring.getStatusMap()).toEqual(JupiterStatusMap);
    });
  });

  describe("signTypedData", () => {
    it("should call signTypedData on the SDK", async () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123458",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);

      custodyKeyring.addAccounts(1);

      const fromAddress = mockSelectedAddresses[0].address;

      await custodyKeyring.signTypedData(fromAddress, "data", {
        version: "V4",
      });

      expect(mockMMISDK.signedTypedData_v4).toHaveBeenCalledWith(fromAddress, "data", "V4", {
        chainId: null,
        note: null,
        originUrl: null,
      });
    });

    it("throws an exception if an invalid version is specified", () => {
      expect(custodyKeyring.signTypedData("0x1236", "data", { version: "V9000" })).rejects.toThrowError(
        "Only signedTypedData_v4 and signedTypedData_v3 is supported",
      );
    });
  });

  describe("signPersonalMessage", () => {
    it("should call signPersonalMessage on the SDK", async () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123458",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);

      custodyKeyring.addAccounts(1);

      const fromAddress = mockSelectedAddresses[0].address;

      await custodyKeyring.signPersonalMessage(fromAddress, "data", null);

      expect(mockMMISDK.signPersonalMessage).toHaveBeenCalledWith(fromAddress, "data", {
        chainId: null,
        note: null,
        originUrl: null,
      });
    });
  });

  describe("getSupportedChains", () => {
    it("should return the supported chains", async () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123458",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);

      custodyKeyring.addAccounts(1);

      const fromAddress = mockSelectedAddresses[0].address;

      const result = await custodyKeyring.getSupportedChains(fromAddress);
      expect(mockMMISDK.getSupportedChains).toHaveBeenCalled();
      expect(result).toEqual(["4"]);
    });
  });

  describe("getAllAccountsWithToken", () => {
    it("should get all the accounts with a specific token", () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123458",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
        {
          name: "myCoolAccount2",
          address: "0x123458",
          custodianDetails: {},
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt2",
          apiUrl: "apiUrl",
          custodyType: "jupiter",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);

      custodyKeyring.addAccounts(1);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { token: _token, ...accountWithoutToken } = mockSelectedAddresses[0];

      expect(custodyKeyring.getAllAccountsWithToken("jwt")).toEqual([
        {
          ...accountWithoutToken,
          authDetails: { jwt: "jwt" },
          meta: { version: 1 },
        },
      ]);
    });
  });
});
