import {
  AuthTypes,
  ICustodianTransactionLink,
  IEIP1559TxParams,
  ILegacyTXParams,
  IMetamaskContractMetadata,
  IRefreshTokenAuthDetails,
  ITokenAuthDetails,
  ITransactionDetails,
} from "@metamask-institutional/types";
import { EventEmitter } from "events";

import { AccountHierarchyNode } from "../../classes/AccountHierarchyNode";
import { NetworkMappings } from "../../classes/NetworkMappings";
import { ICustodianApi } from "../../interfaces/ICustodianApi";
import { IEthereumAccount } from "../../interfaces/IEthereumAccount";
import { IEthereumAccountCustodianDetails } from "../../interfaces/IEthereumAccountCustodianDetails";
import { IGasPrices } from "../../interfaces/IGasPrices";
import { MessageTypes, TypedMessage } from "../../interfaces/ITypedMessage";
import { IJupiterEthereumAccountCustodianDetails } from "../jupiter/interfaces/IJupiterEthereumAccountCustodianDetails";

export class CurvCustodianApi extends EventEmitter implements ICustodianApi {
  constructor(authDetails: ITokenAuthDetails, _authType: AuthTypes, _apiUrl = null, private readonly cacheAge: number) {
    super();
  }

  public integrationVersion = 1;

  // Returns a tree structure
  public async getAccountHierarchy(): Promise<AccountHierarchyNode> {
    return null;
  }

  // Returns a flat array of ethereum accounts (and names)
  public async getEthereumAccounts(
    _chainId?: number,
  ): Promise<IEthereumAccount<IJupiterEthereumAccountCustodianDetails>[]> {
    return null;
  }

  // Used during account import to find wallets and accounts matching an address prefix
  public async getEthereumAccountsByAddress(
    _address: string,
  ): Promise<IEthereumAccount<IJupiterEthereumAccountCustodianDetails>[]> {
    return null;
  }

  public async createTransaction(_txParams: ILegacyTXParams | IEIP1559TxParams): Promise<ITransactionDetails> {
    return null;
  }

  public async getTransaction(_from: string, _custodian_transactionId: string): Promise<ITransactionDetails> {
    return null;
  }

  changeRefreshTokenAuthDetails(authDetails: IRefreshTokenAuthDetails): void {
    throw new Error("Not implemented yet");
  }

  public async getCustomerId(): Promise<string> {
    return null;
  }

  public async getCustomerProof(): Promise<string> {
    return null;
  }

  public async getAllTransactions(): Promise<ITransactionDetails[]> {
    return null;
  }

  async signTypedData_v4(
    _address: string,
    _buffer: TypedMessage<MessageTypes>,
    _version: string,
  ): Promise<ITransactionDetails> {
    return null;
  }

  async signPersonalMessage(_address: string, _message: string): Promise<ITransactionDetails> {
    return null;
  }

  public async suggestGasPrices(_address: string): Promise<IGasPrices> {
    return null;
  }

  private async getNetworkMappings(_organizationId: string): Promise<NetworkMappings> {
    return null;
  }

  public async getErc20Tokens(): Promise<IMetamaskContractMetadata> {
    return null;
  }

  public async getSupportedChains(): Promise<string[]> {
    return null;
  }

  public async getEthereumAccountsByLabelOrAddressName(
    _name: string,
    _chainId?: number,
  ): Promise<IEthereumAccount<IEthereumAccountCustodianDetails>[]> {
    return null;
  }

  async getTransactionLink(_transactionId: string): Promise<Partial<ICustodianTransactionLink>> {
    return null;
  }
}
