// TO FIX import { AccountHierarchyNode } from "../classes/AccountHierarchyNode";
import { IMetamaskContractMetadata } from "./IMetamaskContractMetadata";
import { IEthereumAccount } from "./IEthereumAccount";
import { IEthereumAccountCustodianDetails } from "./IEthereumAccountCustodianDetails";
import { ITransactionDetails } from "./ITransactionDetails";
import { MessageTypes, TypedMessage } from "./ITypedMessage";
import { IEIP1559TxParams, ILegacyTXParams } from "./ITXParams";
// TO FIX import { AuthDetails } from "./AuthDetails";
// TO FIX import { AuthTypes } from "../enum/AuthTypes";
// TO FIX import { CreateTransactionMetadata } from "../types/CreateTransactionMetadata";
import { ICustodianTransactionLink } from "./ICustodian";
import { ISignatureDetails } from "./ISignatureDetails";
import { IRefreshTokenAuthDetails } from "./auth/IRefreshTokenAuthDetails";
import { EventEmitter } from "events";

export interface CustodianApiConstructor {
  new (
    // TO FIX authDetails: AuthDetails,
    // TO FIX authType: AuthTypes,
    apiUrl: string,
    cacheAge: number,
  ): ICustodianApi;
}

export interface ICustodianApi extends EventEmitter {
  integrationVersion: number;

  // TO FIX  getAccountHierarchy(): Promise<AccountHierarchyNode>;

  getEthereumAccounts(chainId?: number): Promise<IEthereumAccount<IEthereumAccountCustodianDetails>[]>;

  getEthereumAccountsByAddress(
    address: string,
    chainId?: number,
  ): Promise<IEthereumAccount<IEthereumAccountCustodianDetails>[]>;

  getEthereumAccountsByLabelOrAddressName(
    name: string,
    chainId?: number,
  ): Promise<IEthereumAccount<IEthereumAccountCustodianDetails>[]>;

  createTransaction(
    txParams: ILegacyTXParams | IEIP1559TxParams,
    // TO FIX txMeta: CreateTransactionMetadata
  ): Promise<ITransactionDetails>;

  getTransaction(from: string, transactionId: string): Promise<ITransactionDetails>;

  getAllTransactions(): Promise<ITransactionDetails[]>;

  // Obtain a JWT from the custodian that we can use to authenticate to
  getCustomerProof(): Promise<string>;

  signTypedData_v4(address: string, buffer: TypedMessage<MessageTypes>, version: string): Promise<ITransactionDetails>;

  signPersonalMessage(address: string, mesage: string): Promise<ITransactionDetails>;

  getSupportedChains(address?: string): Promise<string[]>;

  getTransactionLink(transactionId: string): Promise<Partial<ICustodianTransactionLink>>;

  getSignedMessage?(address: string, signatureId: string): Promise<ISignatureDetails>;

  changeRefreshTokenAuthDetails(authDetails: IRefreshTokenAuthDetails): void;

  // Depcrecated

  getErc20Tokens(): Promise<IMetamaskContractMetadata>;

  getCustomerId(): Promise<string>;
}
