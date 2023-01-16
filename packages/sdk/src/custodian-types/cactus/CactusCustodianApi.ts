import { AccountHierarchyNode } from "../../classes/AccountHierarchyNode";
import { AuthTypes } from "../../enum/AuthTypes";
import { ICustodianApi } from "../../interfaces/ICustodianApi";
import { IEthereumAccount } from "../../interfaces/IEthereumAccount";
import { IMetamaskContractMetadata } from "../../interfaces/IMetamaskContractMetadata";
import { ITransactionDetails } from "../../interfaces/ITransactionDetails";
import { IEIP1559TxParams, ILegacyTXParams } from "../../interfaces/ITXParams";
import { MessageTypes, TypedMessage } from "../../interfaces/ITypedMessage";
import { DefaultCactusCustodianDetails } from "./DefaultCactusCustodianDetails";
import { ICactusEthereumAccountCustodianDetails } from "./interfaces/ICactusEthereumAccountCustodianDetails";
import { CactusClient } from "./CactusClient";
import { IRefreshTokenAuthDetails } from "../../interfaces/auth/IRefreshTokenAuthDetails";
import { CreateTransactionMetadata } from "../../types/CreateTransactionMetadata";
import { SimpleCache } from "../../classes/SimpleCache";
import { ICustodianTransactionLink } from "src/interfaces/ICustodian";
import { EventEmitter } from "events";
import { ISignatureDetails } from "src/interfaces/ISignatureDetails";
import { mapTransactionStatus } from "../../util/map-status";

export class CactusCustodianApi extends EventEmitter implements ICustodianApi {
  private client: CactusClient;
  private cache = new SimpleCache();

  public integrationVersion = 1;

  constructor(
    authDetails: IRefreshTokenAuthDetails,
    _authType: AuthTypes,
    apiUrl = DefaultCactusCustodianDetails.apiUrl,
    private readonly cacheAge: number
  ) {
    super();
    this.client = new CactusClient(apiUrl, authDetails.refreshToken);
  }

  getAccountHierarchy(): Promise<AccountHierarchyNode> {
    return null;
  }

  async getEthereumAccounts(): Promise<
    IEthereumAccount<ICactusEthereumAccountCustodianDetails>[]
  > {
    const accounts = await this.client.getEthereumAccounts();

    const mappedAccounts = accounts.map((account) => ({
      name: account.name || "Cactus wallet",
      address: account.address,
      balance: account.balance,
      custodianDetails: {
        walletId: account.custodianDetails.walletId,
        chainId: account.chainId,
      },
      labels: account.labels
        ? account.labels.map((label) => ({ key: "label", value: label }))
        : [],
    }));

    return mappedAccounts;
  }

  async getEthereumAccountsByAddress(
    address: string
  ): Promise<IEthereumAccount<ICactusEthereumAccountCustodianDetails>[]> {
    const accounts = await this.getEthereumAccounts();

    return accounts.filter((account) =>
      account.address.toLowerCase().includes(address.toLowerCase())
    );
  }

  async getEthereumAccountsByLabelOrAddressName(
    name: string
  ): Promise<IEthereumAccount<ICactusEthereumAccountCustodianDetails>[]> {
    const accounts = await this.getEthereumAccounts();

    if (!name.length) {
      return accounts;
    }

    return accounts.filter((account) => new RegExp(name).test(account.name));
  }

  async createTransaction(
    txParams: IEIP1559TxParams | ILegacyTXParams,
    txMeta: CreateTransactionMetadata
  ): Promise<ITransactionDetails> {
    const result = await this.client.createTransaction(
      { chainId: Number(txMeta.chainId), note: txMeta.note },
      txParams
    );

    return {
      transactionStatus: result.transactionStatus,
      custodian_transactionId: result.custodian_transactionId,
      from: result.from,
      gasLimit: result.gasLimit,
      gasPrice: result.gasPrice,
      maxFeePerGas: result.maxFeePerGas,
      maxPriorityFeePerGas: result.maxFeePerGas,
      nonce: result.nonce,
      transactionHash: result.transactionHash,
    };
  }

  async getTransaction(
    _from: string,
    custodian_transactionId: string
  ): Promise<ITransactionDetails> {
    const result = await this.client.getTransaction(custodian_transactionId);

    // Cactus API sometimes returns 200 but gives us nothing
    if (!result) {
      return null;
    }

    return {
      transactionStatus: result.transactionStatus,
      custodian_transactionId: result.custodian_transactionId,
      from: result.from,
      gasLimit: result.gasLimit,
      gasPrice: result.gasPrice,
      maxFeePerGas: result.maxFeePerGas,
      maxPriorityFeePerGas: result.maxPriorityFeePerGas,
      nonce: result.nonce,
      transactionHash: result.transactionHash,
    };
  }

  async getSignedMessage(
    address: string,
    custodian_signedMessageId: string
  ): Promise<ISignatureDetails> {
    const result = await this.client.getSignedMessage(
      custodian_signedMessageId
    );

    let signature = result?.signature;

    if (!result) {
      return null;
    }

    if (result.signature?.length) {
      signature = result.signature;
    }

    return {
      id: result.custodian_transactionId,
      signature,
      status: mapTransactionStatus(result.transactionStatus),
    };
  }

  async getCustomerId(): Promise<string> {
    return "cactus-customer";
  }

  async getAllTransactions(): Promise<ITransactionDetails[]> {
    throw new Error("Not implemented");
  }

  // Obtain a JWT from the custodian that we can use to authenticate to
  public async getCustomerProof(): Promise<string> {
    const { jwt } = await this.client.getCustomerProof();
    return jwt;
  }

  async signTypedData_v4(
    address: string,
    message: TypedMessage<MessageTypes>,
    version: string
  ): Promise<ITransactionDetails> {
    const result = await this.client.signTypedData_v4(
      address,
      message,
      version,
      message.domain?.chainId
    );

    return {
      custodian_transactionId: result.custodian_transactionId,
      transactionStatus: result.transactionStatus,
      from: address,
    };
  }

  async signPersonalMessage(
    address: string,
    message: string
  ): Promise<ITransactionDetails> {
    const result = await this.client.signPersonalMessage(address, message);

    return {
      custodian_transactionId: result.custodian_transactionId,
      transactionStatus: result.transactionStatus,
      from: address,
    };
  }

  async getErc20Tokens(): Promise<IMetamaskContractMetadata> {
    return {};
  }

  async getSupportedChains(): Promise<string[]> {
    return this.cache.tryCachingArray<string>(
      "getSupportedChains",
      this.cacheAge,
      async () => {
        const { networks } = await this.client.getChainIds();
        return networks.map((network) => network.chainID);
      }
    );
  }

  async getTransactionLink(
    _transactionId: string
  ): Promise<Partial<ICustodianTransactionLink>> {
    return null;
  }

  changeRefreshTokenAuthDetails(authDetails: IRefreshTokenAuthDetails): void {
    throw new Error("Not implemented yet");
  }
}
