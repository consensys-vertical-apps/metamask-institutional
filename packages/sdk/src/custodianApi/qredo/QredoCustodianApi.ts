import { SimpleCache } from "@metamask-institutional/simplecache";
import {
  AuthTypes,
  ICustodianTransactionLink,
  IEIP1559TxParams,
  ILegacyTXParams,
  IMetamaskContractMetadata,
  IRefreshTokenAuthDetails,
  ISignatureDetails,
  ITransactionDetails,
  TransactionStatus,
} from "@metamask-institutional/types";
import { EventEmitter } from "events";

import { AccountHierarchyNode } from "../../classes/AccountHierarchyNode";
import { NetworkMappings } from "../../classes/NetworkMappings";
import { REFRESH_TOKEN_CHANGE_EVENT } from "../../constants/constants";
import { ICustodianApi } from "../../interfaces/ICustodianApi";
import { IEthereumAccount } from "../../interfaces/IEthereumAccount";
import { MessageTypes, TypedMessage } from "../../interfaces/ITypedMessage";
import { CreateTransactionMetadata } from "../../types/CreateTransactionMetadata";
import { mapTransactionStatus } from "../../util/map-status";
import { DefaultQredoCustodianDetails } from "./DefaultQredoCustodianDetails";
import { IQredoEthereumAccountCustodianDetails } from "./interfaces/IQredoEthereumAccountCustodianDetails";
import { qredoNetworkMappings } from "./qredo-network-mappings";
import { QredoClient } from "./QredoClient";

export class QredoCustodianApi extends EventEmitter implements ICustodianApi {
  private client: QredoClient;
  public networkMappings: NetworkMappings;
  private cache = new SimpleCache();

  public integrationVersion = 1;

  constructor(
    authDetails: IRefreshTokenAuthDetails,
    _authType: AuthTypes,
    apiUrl = DefaultQredoCustodianDetails.apiUrl,
    private readonly cacheAge: number,
  ) {
    super();
    this.client = new QredoClient(apiUrl, authDetails.refreshToken);
    this.networkMappings = new NetworkMappings(qredoNetworkMappings);

    // This event is "bottom up" - from the custodian via the client.
    // Just bubble it up to MMISDK

    this.client.on(REFRESH_TOKEN_CHANGE_EVENT, event => {
      this.emit(REFRESH_TOKEN_CHANGE_EVENT, event);
    });
  }

  getAccountHierarchy(): Promise<AccountHierarchyNode> {
    return null;
  }

  async getEthereumAccounts(): Promise<IEthereumAccount<IQredoEthereumAccountCustodianDetails>[]> {
    const accounts = await this.client.getEthereumAccounts();

    const mappedAccounts = accounts.map(account => ({
      name: account.labels.find(label => label.key === "wallet-name").value,
      address: account.address,
      balance: null,
      custodianDetails: {
        accountId: account.walletID,
      },
      chainId: this.networkMappings.getMappingByCustodianName(account.network).chainId,
      labels: account.labels
        .filter(label => label.key !== "wallet-name")
        .map(label => ({
          key: label.name,
          value: label.value,
        })),
    }));

    return mappedAccounts;
  }

  async getEthereumAccountsByAddress(
    address: string,
  ): Promise<IEthereumAccount<IQredoEthereumAccountCustodianDetails>[]> {
    const accounts = await this.getEthereumAccounts();
    return accounts.filter(account => account.address.toLowerCase().includes(address.toLowerCase()));
  }

  async getEthereumAccountsByLabelOrAddressName(
    name: string,
  ): Promise<IEthereumAccount<IQredoEthereumAccountCustodianDetails>[]> {
    const accounts = await this.getEthereumAccounts();
    return accounts.filter(account => account.name.includes(name));
  }

  async createTransaction(
    txParams: IEIP1559TxParams | ILegacyTXParams,
    txMeta: CreateTransactionMetadata,
  ): Promise<ITransactionDetails> {
    const fromAddress = txParams.from;

    const result = await this.client.createTransaction(
      { from: fromAddress, chainId: txMeta.chainId, note: txMeta.note },
      txParams,
    );

    return {
      transactionStatus: result.status,
      custodian_transactionId: result.txID,
      from: txParams.from,
      gasLimit: result.gasLimit,
      gasPrice: result.gasPrice,
      maxFeePerGas: null,
      maxPriorityFeePerGas: null,
      nonce: result.nonce.toString(10),
      transactionHash: result.txHash,
    };
  }

  async getTransaction(_from: string, custodian_transactionId: string): Promise<ITransactionDetails> {
    const result = await this.client.getTransaction(custodian_transactionId);

    return {
      transactionStatus: result.status,
      custodian_transactionId: result.txID,
      from: result.from || null,
      gasLimit: result.gasLimit,
      gasPrice: result.gasPrice,
      maxFeePerGas: null,
      maxPriorityFeePerGas: null,
      nonce: result.nonce?.toString(10),
      transactionHash: result.txHash,
    };
  }

  async getCustomerId(): Promise<string> {
    return "qredo-customer";
  }

  async getSignedMessage(_address: string, custodian_signedMessageId: string): Promise<ISignatureDetails> {
    const result = await this.client.getSignedMessage(custodian_signedMessageId);

    let signature = result?.signature;

    if (!result) {
      return null;
    }

    if (result.signature?.length) {
      signature = "0x" + result.signature;
    }

    return {
      id: result.sigID,
      signature,
      status: mapTransactionStatus(result.status),
    };
  }

  async getAllTransactions(): Promise<ITransactionDetails[]> {
    const results = await this.client.getTransactions();

    return results.map(result => ({
      transactionStatus: result.status as TransactionStatus,
      custodian_transactionId: result.txID,
      from: null,
    }));
  }

  // Obtain a JWT from the custodian that we can use to authenticate to
  public async getCustomerProof(): Promise<string> {
    const { jwt } = await this.client.getCustomerProof();
    return jwt;
  }

  async signPersonalMessage(address: string, message: string): Promise<ITransactionDetails> {
    const result = await this.client.signPersonalMessage(address, message);

    return {
      custodian_transactionId: result.sigID,
      transactionStatus: result.status,
      from: address,
    };
  }

  async signTypedData_v4(
    address: string,
    message: TypedMessage<MessageTypes>,
    _version: string,
  ): Promise<ITransactionDetails> {
    const result = await this.client.signTypedData_v4(address, message);

    return {
      custodian_transactionId: result.sigID,
      transactionStatus: result.status,
      from: address,
    };
  }

  async getErc20Tokens(): Promise<IMetamaskContractMetadata> {
    return {};
  }

  async getSupportedChains(): Promise<string[]> {
    return this.cache.tryCachingArray<string>("getSupportedChains", this.cacheAge, async () => {
      const { networks } = await this.client.getNetworks();
      return networks.map(network => network.chainID);
    });
  }

  async getTransactionLink(_transactionId: string): Promise<Partial<ICustodianTransactionLink>> {
    return null;
  }

  changeRefreshTokenAuthDetails(authDetails: IRefreshTokenAuthDetails): void {
    throw new Error("Not implemented yet");
  }
}
