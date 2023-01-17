import { EventEmitter } from "events";
import {
  ICustodianTransactionLink,
  AuthTypes,
  IRefreshTokenAuthDetails,
  ITokenAuthDetails,
  IMetamaskContractMetadata,
  ITransactionDetails,
  TransactionStatus,
  IEIP1559TxParams,
  ILegacyTXParams
} from "@metamask-institutional/types";
import { AccountHierarchyNode } from "../../classes/AccountHierarchyNode";
import { SimpleCache } from "@metamask-institutional/simplecache";
import { ICustodianApi } from "../../interfaces/ICustodianApi";
import { IEthereumAccount } from "../../interfaces/IEthereumAccount";
import { MessageTypes, TypedMessage } from "../../interfaces/ITypedMessage";
import { CreateTransactionMetadata } from "../../types/CreateTransactionMetadata";
import { getTokenIssuer } from "../../util/get-token-issuer";
import { DefaultJupiterCustodianDetails } from "./DefaultJupiterCustodianDetails";
import { IJupiterEthereumAccountCustodianDetails } from "./interfaces/IJupiterEthereumAccountCustodianDetails";
import { JupiterClient } from "./JupiterClient";

export class JupiterCustodianApi extends EventEmitter implements ICustodianApi {
  private client: JupiterClient;
  private jwt; // Used to extract the issuer from the used token
  private cache = new SimpleCache();

  public integrationVersion = 1;

  constructor(
    authDetails: ITokenAuthDetails,
    _authType: AuthTypes,
    apiUrl = DefaultJupiterCustodianDetails.apiUrl,
    private readonly cacheAge: number
  ) {
    super();
    const { jwt } = authDetails;
    this.client = new JupiterClient(apiUrl, jwt);
    this.jwt = jwt;
  }

  getAccountHierarchy(): Promise<AccountHierarchyNode> {
    return null;
  }

  async getEthereumAccounts(): Promise<
    IEthereumAccount<IJupiterEthereumAccountCustodianDetails>[]
  > {
    const accounts = await this.client.getEthereumAccounts();

    const mappedAccounts = accounts.map((account) => ({
      name: account.label,
      address: account.address,
      balance: account.balance,
      custodianDetails: {
        accountId: account.id,
      },
      labels: [{ key: "label", value: account.label }],
    }));

    return mappedAccounts;
  }

  async getEthereumAccountsByAddress(
    address: string
  ): Promise<IEthereumAccount<IJupiterEthereumAccountCustodianDetails>[]> {
    const accounts = await this.getEthereumAccounts();
    return accounts.filter((account) =>
      account.address.toLowerCase().includes(address.toLowerCase())
    );
  }

  async getEthereumAccountsByLabelOrAddressName(
    name: string
  ): Promise<IEthereumAccount<IJupiterEthereumAccountCustodianDetails>[]> {
    const accounts = await this.getEthereumAccounts();
    return accounts.filter((account) => account.name.includes(name));
  }

  async createTransaction(
    txParams: IEIP1559TxParams | ILegacyTXParams,
    txMeta: CreateTransactionMetadata
  ): Promise<ITransactionDetails> {
    const fromAddress = txParams.from;

    const accounts = await this.getEthereumAccountsByAddress(fromAddress);

    if (!accounts.length) {
      throw new Error("No such ethereum account!");
    }

    const accountId = accounts[0].custodianDetails.accountId;

    const result = await this.client.createTransaction(
      { accountId, chainId: txMeta.chainId },
      txParams
    );

    return {
      transactionStatus: result.transactionStatus,
      custodian_transactionId: result.id,
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

    return {
      transactionStatus: result.transactionStatus,
      custodian_transactionId: result.id,
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
    return "jupiter-customer";
  }

  async getAllTransactions(): Promise<ITransactionDetails[]> {
    const results = await this.client.getTransactions();

    return results.map((result) => ({
      transactionStatus: result.transactionStatus as TransactionStatus,
      custodian_transactionId: result.id,
      from: result.from,
    }));
  }

  // Obtain a JWT from the custodian that we can use to authenticate to
  public async getCustomerProof(): Promise<string> {
    const customerId = await this.getCustomerId();
    const issuer = getTokenIssuer(this.jwt);

    const { jwt } = await this.client.getCustomerProof(customerId, issuer);
    return jwt;
  }

  async signTypedData_v4(
    address: string,
    message: TypedMessage<MessageTypes>,
    version: string
  ): Promise<ITransactionDetails> {
    const accounts = await this.getEthereumAccountsByAddress(address);

    if (!accounts.length) {
      throw new Error("No such ethereum account!");
    }

    const accountId = accounts[0].custodianDetails.accountId;

    const result = await this.client.signTypedData_v4(
      accountId,
      message,
      version
    );

    return {
      custodian_transactionId: result.id,
      transactionStatus: result.transactionStatus,
      from: result.from,
    };
  }

  async signPersonalMessage(
    address: string,
    message: string
  ): Promise<ITransactionDetails> {
    const accounts = await this.getEthereumAccountsByAddress(address);

    if (!accounts.length) {
      throw new Error("No such ethereum account!");
    }

    const accountId = accounts[0].custodianDetails.accountId;

    const result = await this.client.signPersonalMessage(accountId, message);

    return {
      custodian_transactionId: result.id,
      transactionStatus: result.transactionStatus,
      from: result.from,
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
        const response = await this.client.getSupportedChains();
        return Object.keys(response);
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
