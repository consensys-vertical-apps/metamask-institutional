import {
  CustodianApiConstructor,
  ICustodianApi,
} from "../interfaces/ICustodianApi";
import { AccountHierarchyNode } from "./AccountHierarchyNode";
import { IEthereumAccount } from "../interfaces/IEthereumAccount";
import {
  IEIP1559TxParams,
  ILegacyTXParams,
  ITransactionDetails,
  IMetamaskContractMetadata,
  AuthDetails,
  AuthTypes,
  ICustodianTransactionLink,
  ISignatureDetails,
  IRefreshTokenAuthDetails
} from "@metamask-institutional/types";
import { IEthereumAccountCustodianDetails } from "../interfaces/IEthereumAccountCustodianDetails";
import { orderByProperty } from "../util/order-by-property";
import { SimpleCache } from "@metamask-institutional/simplecache";
import { MessageTypes, TypedMessage } from "../interfaces/ITypedMessage";
import { CreateTransactionMetadata } from "../types/CreateTransactionMetadata";
import { EventEmitter } from "events";
import {
  REFRESH_TOKEN_CHANGE_EVENT,
  INTERACTIVE_REPLACEMENT_TOKEN_CHANGE_EVENT,
} from "../constants/constants";

export class MMISDK extends EventEmitter {
  custodianApi: ICustodianApi;

  private cache = new SimpleCache();

  constructor(
    custodianApi: CustodianApiConstructor,
    authDetails: AuthDetails,
    authType: AuthTypes,
    apiUrl: string,
    private defaultCacheAgeSeconds = -1
  ) {
    super();

    this.custodianApi = new custodianApi(
      authDetails,
      authType,
      apiUrl,
      defaultCacheAgeSeconds
    );

    // This event is "bottom up - from the custodian via the client".
    // Just bubble it up to to CustodyKeyring

    this.custodianApi.on(REFRESH_TOKEN_CHANGE_EVENT, (event) => {
      this.emit(REFRESH_TOKEN_CHANGE_EVENT, event);
    });

    this.custodianApi.on(
      INTERACTIVE_REPLACEMENT_TOKEN_CHANGE_EVENT,
      (event) => {
        this.emit(INTERACTIVE_REPLACEMENT_TOKEN_CHANGE_EVENT, event);
      }
    );
  }

  // Do an in-situ replacement of the auth details
  public changeRefreshTokenAuthDetails(
    authDetails: IRefreshTokenAuthDetails
  ): void {
    this.custodianApi.changeRefreshTokenAuthDetails(authDetails);
  }

  public getAccountHierarchy(): Promise<AccountHierarchyNode> {
    return this.custodianApi.getAccountHierarchy();
  }

  // Get ethereum accounts optionally based on the ID of the parent object
  public async getEthereumAccounts(
    maxCacheAgeSeconds = this.defaultCacheAgeSeconds
  ): Promise<IEthereumAccount<IEthereumAccountCustodianDetails>[]> {
    console.log("GetEthereumAccounts MMI SDK");

    const cacheKey = "getEthereumAccounts";

    return this.cache.tryCachingArray<
      IEthereumAccount<IEthereumAccountCustodianDetails>
    >(cacheKey, maxCacheAgeSeconds, async () => {
      const accounts = await this.custodianApi.getEthereumAccounts();
      return accounts.sort(orderByProperty("balance")).reverse();
    });
  }

  // Gets ethereum accounts based only on their address prefix
  public async getEthereumAccountsByAddress(
    address: string,
    maxCacheAgeSeconds = this.defaultCacheAgeSeconds
  ): Promise<IEthereumAccount<IEthereumAccountCustodianDetails>[]> {
    const cacheKey = "getEthereumAccountsByAddress-" + address;

    return this.cache.tryCachingArray<
      IEthereumAccount<IEthereumAccountCustodianDetails>
    >(cacheKey, maxCacheAgeSeconds, async () => {
      const accounts = await this.custodianApi.getEthereumAccountsByAddress(
        address
      );

      return accounts.sort(orderByProperty("balance")).reverse();
    });
  }

  // Gets ethereum accounts based only on their labels prefix
  public async getEthereumAccountsByLabelOrAddressName(
    name: string,
    maxCacheAgeSeconds = this.defaultCacheAgeSeconds
  ): Promise<IEthereumAccount<IEthereumAccountCustodianDetails>[]> {
    const cacheKey = "getEthereumAccountsByLabelOrAddressName-" + name;

    return this.cache.tryCachingArray<
      IEthereumAccount<IEthereumAccountCustodianDetails>
    >(cacheKey, maxCacheAgeSeconds, async () => {
      const accounts = await this.custodianApi.getEthereumAccountsByLabelOrAddressName(
        name
      );
      return accounts.sort(orderByProperty("balance")).reverse();
    });
  }

  public async createTransaction(
    txParams: IEIP1559TxParams | ILegacyTXParams,
    txMeta?: CreateTransactionMetadata
  ): Promise<ITransactionDetails> {
    const result = await this.custodianApi.createTransaction(txParams, txMeta);
    return result;
  }

  public getTransaction(
    from: string,
    transactionId: string
  ): Promise<ITransactionDetails> {
    return this.custodianApi.getTransaction(from, transactionId);
  }

  public getAllTransactions(): Promise<ITransactionDetails[]> {
    return this.custodianApi.getAllTransactions();
  }

  public getCustomerId(): Promise<string> {
    return this.custodianApi.getCustomerId();
  }

  public async signedTypedData_v4(
    address: string,
    buffer: TypedMessage<MessageTypes>,
    note = ""
  ): Promise<ITransactionDetails> {
    const result = await this.custodianApi.signTypedData_v4(
      address,
      buffer,
      note
    );

    return result;
  }

  public async signPersonalMessage(
    address: string,
    message: string
  ): Promise<ITransactionDetails> {
    const result = await this.custodianApi.signPersonalMessage(
      address,
      message
    );

    return result;
  }

  // Calls getSignature by Id from the custodian API
  public async getSignature(
    address: string,
    signatureId: string
  ): Promise<ISignatureDetails> {
    return this.custodianApi.getSignedMessage(address, signatureId);
  }

  public async getCustomerProof(): Promise<string> {
    return this.custodianApi.getCustomerProof();
  }

  public async getErc20Tokens(): Promise<IMetamaskContractMetadata> {
    return this.custodianApi.getErc20Tokens();
  }

  public async getSupportedChains(address: string): Promise<string[]> {
    return this.custodianApi.getSupportedChains(address);
  }

  public async getTransactionLink(
    transactionId: string
  ): Promise<Partial<ICustodianTransactionLink>> {
    return this.custodianApi.getTransactionLink(transactionId);
  }
}

export { ICustodianDetails } from "../interfaces/ICustodianDetails";

// @TODO We don't need it right now, come back later after CustodyKeyring is in its own package
// and check if we still want to export it here for some reason
// export { CustodyKeyring } from "./CustodyKeyring";
