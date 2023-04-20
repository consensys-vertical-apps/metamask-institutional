import {
  AuthTypes,
  ICustodianTransactionLink,
  IEIP1559TxParams,
  ILegacyTXParams,
  IMetamaskContractMetadata,
  IRefreshTokenAuthDetails,
  ISignatureDetails,
  ITokenAuthDetails,
  ITransactionDetails,
} from "@metamask-institutional/types";
import { EventEmitter } from "events";

import { AccountHierarchyNode } from "../../classes/AccountHierarchyNode";
import { ICustodianApi } from "../../interfaces/ICustodianApi";
import { IEthereumAccount } from "../../interfaces/IEthereumAccount";
import { MessageTypes, TypedMessage } from "../../interfaces/ITypedMessage";
import { BitgoClient } from "./BitgoClient";
import { DefaultBitgoCustodianDetails } from "./DefaultBitgoCustodianDetails";
import { IBitgoEthereumAccountCustodianDetails } from "./interfaces/IBitgoEthereumAccountCustodianDetails";

const BITGO_ADDITIONAL_GAS = 100000;

export class BitgoCustodianApi extends EventEmitter implements ICustodianApi {
  private client: BitgoClient;
  private jwt; // Used to extract the issuer from the used token

  public integrationVersion = 1;

  constructor(
    authDetails: ITokenAuthDetails,
    _authType: AuthTypes,
    apiUrl = DefaultBitgoCustodianDetails.apiUrl,
    private readonly _cacheAge: number,
  ) {
    super();
    const { jwt } = authDetails;
    this.client = new BitgoClient(apiUrl, jwt);
    this.jwt = jwt;
  }

  getAccountHierarchy(): Promise<AccountHierarchyNode> {
    return null;
  }

  async getEthereumAccounts(chainId?: number): Promise<IEthereumAccount<IBitgoEthereumAccountCustodianDetails>[]> {
    const accounts = await this.client.getEthereumAccounts();

    const mappedAccounts = accounts.map(account => ({
      name: account.labels.find(label => label.key === "Wallet Name")?.value || "Unnamed Bitgo Wallet",
      address: account.address,
      balance: account.balance,
      custodianDetails: {
        accountId: account.custodianDetails.id,
        coinId: account.custodianDetails.coin,
      },
      chainId: account.chainId,
      labels: account.labels.filter(label => label.key !== "Wallet Name"),
    }));

    if (!chainId) {
      return mappedAccounts;
    } else {
      return mappedAccounts.filter(account => account.chainId === chainId);
    }
  }

  async getEthereumAccountsByAddress(
    address: string,
  ): Promise<IEthereumAccount<IBitgoEthereumAccountCustodianDetails>[]> {
    const accounts = await this.getEthereumAccounts();
    return accounts.filter(account => account.address.toLowerCase().includes(address.toLowerCase()));
  }

  async getEthereumAccountsByLabelOrAddressName(
    name: string,
  ): Promise<IEthereumAccount<IBitgoEthereumAccountCustodianDetails>[]> {
    const accounts = await this.getEthereumAccounts();
    return accounts.filter(account => account.name.includes(name));
  }

  async createTransaction(txParams: IEIP1559TxParams | ILegacyTXParams): Promise<ITransactionDetails> {
    const fromAddress = txParams.from;

    const accounts = await this.getEthereumAccountsByAddress(fromAddress);

    if (!accounts.length) {
      throw new Error("No such ethereum account!");
    }

    const walletId = accounts[0].custodianDetails.accountId;
    const coinId = accounts[0].custodianDetails.coinId;

    txParams.gasLimit = (Number(txParams.gasLimit) + BITGO_ADDITIONAL_GAS).toString();

    const result = await this.client.createTransaction({ walletId, coinId }, txParams);

    return {
      transactionStatus: result.transactionStatus,
      custodian_transactionId: result.custodianTransactionId,
      from: result.from,
      gasLimit: result.gasLimit,
      gasPrice: result.gasPrice,
      maxFeePerGas: result.maxFeePerGas,
      maxPriorityFeePerGas: result.maxFeePerGas,
      nonce: result.nonce,
      transactionHash: result.transactionHash,
    };
  }

  async getTransaction(_from: string, custodian_transactionId: string): Promise<ITransactionDetails> {
    const result = await this.client.getTransaction(custodian_transactionId);

    return {
      transactionStatus: result.transactionStatus,
      custodian_transactionId: result.custodianTransactionId,
      from: result.from,
      gasLimit: result.gasLimit,
      gasPrice: result.gasPrice,
      maxFeePerGas: result.maxFeePerGas,
      maxPriorityFeePerGas: result.maxPriorityFeePerGas,
      nonce: result.nonce,
      transactionHash: result.transactionHash,
    };
  }

  async getCustomerId(): Promise<string> {
    return "bitgo-customer";
  }

  async getAllTransactions(): Promise<ITransactionDetails[]> {
    const results = await this.client.getTransactions();

    return results.map(result => ({
      transactionStatus: result.transactionStatus,
      custodian_transactionId: result.custodianTransactionId,
      from: result.from,
      gasLimit: result.gasLimit,
      gasPrice: result.gasPrice,
      maxFeePerGas: result.maxFeePerGas,
      maxPriorityFeePerGas: result.maxPriorityFeePerGas,
      nonce: result.nonce,
      transactionHash: result.transactionHash,
    }));
  }

  // Obtain a JWT from the custodian that we can use to authenticate to
  public async getCustomerProof(): Promise<string> {
    const { data } = await this.client.getCustomerProof();
    return data;
  }

  async getErc20Tokens(): Promise<IMetamaskContractMetadata> {
    return {};
  }

  async getSupportedChains(address: string): Promise<string[]> {
    const account = await this.client.getEthereumAccountByAddress(address);
    if (!account) {
      return [];
    }

    return [account.chainId.toString()];
  }

  async getTransactionLink(_transactionId: string): Promise<Partial<ICustodianTransactionLink>> {
    return null;
  }

  changeRefreshTokenAuthDetails(authDetails: IRefreshTokenAuthDetails): void {
    throw new Error("BitGo does not support refresh tokens");
  }

  async getSignedMessage(address: string, custodian_signedMessageId: string): Promise<ISignatureDetails> {
    const accounts = await this.getEthereumAccountsByAddress(address);

    if (!accounts.length) {
      throw new Error("No such ethereum account!");
    }

    const walletId = accounts[0].custodianDetails.accountId;
    const coinId = accounts[0].custodianDetails.coinId;

    const result = await this.client.getSignedMessage(custodian_signedMessageId, coinId, walletId);

    if (!result) {
      return null;
    }

    return {
      id: result.data.id,
      signature: result.data.signature,
      status: result.data.status,
    };
  }

  async signTypedData_v4(
    address: string,
    message: TypedMessage<MessageTypes>,
    version: string,
  ): Promise<ITransactionDetails> {
    const accounts = await this.getEthereumAccountsByAddress(address);

    if (!accounts.length) {
      throw new Error("No such ethereum account!");
    }

    const walletId = accounts[0].custodianDetails.accountId;
    const coinId = accounts[0].custodianDetails.coinId;

    const result = await this.client.signTypedData_v4(address, message, coinId, walletId, version);

    return {
      custodian_transactionId: result.data.id,
      transactionStatus: "created",
      from: address,
    };
  }

  async signPersonalMessage(address: string, message: string): Promise<ITransactionDetails> {
    const accounts = await this.getEthereumAccountsByAddress(address);

    if (!accounts.length) {
      throw new Error("No such ethereum account!");
    }

    const walletId = accounts[0].custodianDetails.accountId;
    const coinId = accounts[0].custodianDetails.coinId;

    const result = await this.client.signPersonalMessage(address, message, coinId, walletId);

    return {
      custodian_transactionId: result.data.id,
      transactionStatus: "created",
      from: address,
    };
  }
}
