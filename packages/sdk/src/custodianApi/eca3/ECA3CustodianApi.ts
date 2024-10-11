import { SimpleCache } from "@metamask-institutional/simplecache";
import {
  AuthTypes,
  IApiCallLogEntry,
  ICustodianTransactionLink,
  IEIP1559TxParams,
  ILegacyTXParams,
  IMetamaskContractMetadata,
  IRefreshTokenAuthDetails,
  ISignatureDetails,
  ITransactionDetails,
} from "@metamask-institutional/types";
import { EventEmitter } from "events";
import { SignedMessageMetadata } from "src/types/SignedMessageMetadata";
import { SignedTypedMessageMetadata } from "src/types/SignedTypedMessageMetadata";

import { AccountHierarchyNode } from "../../classes/AccountHierarchyNode";
import {
  API_REQUEST_LOG_EVENT,
  INTERACTIVE_REPLACEMENT_TOKEN_CHANGE_EVENT,
  REFRESH_TOKEN_CHANGE_EVENT,
} from "../../constants/constants";
import { ICustodianApi } from "../../interfaces/ICustodianApi";
import { IEthereumAccount } from "../../interfaces/IEthereumAccount";
import { IEthereumAccountCustodianDetails } from "../../interfaces/IEthereumAccountCustodianDetails";
import { MessageTypes, TypedMessage } from "../../interfaces/ITypedMessage";
import { CreateTransactionMetadata } from "../../types/CreateTransactionMetadata";
import { ECA3Client } from "./ECA3Client";
import { JsonRpcTransactionParams } from "./rpc-payloads/JsonRpcCreateTransactionPayload";
import { JsonRpcReplaceTransactionParams } from "./rpc-payloads/JsonRpcReplaceTransactionPayload";
import { hexlify } from "./util/hexlify";
import { mapStatusObjectToStatusText } from "./util/mapStatusObjectToStatusText";

export class ECA3CustodianApi extends EventEmitter implements ICustodianApi {
  private client: ECA3Client;
  private cache = new SimpleCache();

  public integrationVersion = 2;

  constructor(
    authDetails: IRefreshTokenAuthDetails,
    _authType: AuthTypes,
    apiUrl: string,
    private readonly cacheAge: number,
  ) {
    super();
    const { refreshToken } = authDetails;
    this.client = new ECA3Client(apiUrl, refreshToken, authDetails.refreshTokenUrl);

    // This event is "bottom up" - from the custodian via the client.
    // Just bubble it up to MMISDK

    this.client.on(REFRESH_TOKEN_CHANGE_EVENT, event => {
      this.emit(REFRESH_TOKEN_CHANGE_EVENT, event);
    });

    this.client.on(INTERACTIVE_REPLACEMENT_TOKEN_CHANGE_EVENT, event => {
      this.emit(INTERACTIVE_REPLACEMENT_TOKEN_CHANGE_EVENT, event);
    });

    this.client.on(API_REQUEST_LOG_EVENT, (event: IApiCallLogEntry) => {
      this.emit(API_REQUEST_LOG_EVENT, event);
    });
  }

  getAccountHierarchy(): Promise<AccountHierarchyNode> {
    return null;
  }

  async getEthereumAccounts(): Promise<IEthereumAccount<IEthereumAccountCustodianDetails>[]> {
    const accounts = await this.client.listAccounts();

    const mappedAccounts = accounts.result.map(account => ({
      name: account.name,
      address: account.address,
      custodianDetails: null,
      labels: account.tags.map(tag => ({ key: tag.name, value: tag.value })),
      metadata: account.metadata,
    }));

    return mappedAccounts;
  }

  async getEthereumAccountsByAddress(address: string): Promise<IEthereumAccount<IEthereumAccountCustodianDetails>[]> {
    const accounts = await this.getEthereumAccounts();

    return accounts.filter(account => account.address.toLowerCase().includes(address.toLowerCase()));
  }

  async getListAccountsSigned(): Promise<string> {
    const { result } = await this.client.listAccountsSigned();

    return result.jwt;
  }
  async getEthereumAccountsByLabelOrAddressName(
    name: string,
  ): Promise<IEthereumAccount<IEthereumAccountCustodianDetails>[]> {
    const accounts = await this.getEthereumAccounts();
    return accounts.filter(account => account.name.includes(name));
  }

  async createTransaction(
    txParams: IEIP1559TxParams | ILegacyTXParams,
    txMeta: CreateTransactionMetadata,
  ): Promise<ITransactionDetails> {
    const fromAddress = txParams.from;

    const accounts = await this.getEthereumAccountsByAddress(fromAddress);

    if (!accounts.length) {
      throw new Error("No such ethereum account!");
    }

    const payload: Partial<JsonRpcTransactionParams> = {
      from: accounts[0].address, // already hexlified
      to: txParams.to, // already hexlified
      data: txParams.data, // already hexlified
      value: hexlify(txParams.value),
      gas: hexlify(txParams.gasLimit),
      type: hexlify(txParams.type),
    };

    if (Number(txParams.type) === 2) {
      payload.maxFeePerGas = hexlify((txParams as IEIP1559TxParams).maxFeePerGas);
      payload.maxPriorityFeePerGas = hexlify((txParams as IEIP1559TxParams).maxPriorityFeePerGas);
    } else {
      payload.gasPrice = hexlify((txParams as ILegacyTXParams).gasPrice);
    }

    const { result } = await this.client.createTransaction([
      payload as JsonRpcTransactionParams,
      {
        chainId: hexlify(txMeta.chainId),
        note: txMeta.note,
        originUrl: txMeta.origin,
        transactionCategory: txMeta.transactionCategory,
        custodianPublishesTransaction: txMeta.custodianPublishesTransaction,
        rpcUrl: txMeta.rpcUrl,
      },
    ]);

    return {
      custodian_transactionId: result,
      transactionStatus: "created",
      from: accounts[0].address,
    };
  }

  async getTransaction(_from: string, custodian_transactionId: string): Promise<ITransactionDetails> {
    const { result } = await this.client.getTransaction([custodian_transactionId]);

    if (!result) {
      return null;
    }

    return {
      transactionStatus: mapStatusObjectToStatusText(result.transaction.status),
      transactionStatusDisplayText: result.transaction.status?.displayText,
      custodian_transactionId: result.transaction.id,
      from: result.transaction.from,
      gasLimit: result.transaction.gas,
      gasPrice: result.transaction.gasPrice,
      maxFeePerGas: result.transaction.maxFeePerGas,
      maxPriorityFeePerGas: result.transaction.maxPriorityFeePerGas,
      nonce: result.transaction.nonce,
      transactionHash: result.transaction.hash,
      reason: result.transaction.status.reason,
      to: result.transaction.to,
      signedRawTransaction: result.transaction.signedRawTransaction,
      chainId: result.metadata.chainId,
      custodianPublishesTransaction: result.metadata.custodianPublishesTransaction,
      rpcUrl: result.metadata.rpcUrl,
    };
  }

  async replaceTransaction(txParams: JsonRpcReplaceTransactionParams): Promise<{ transactionId: string }> {
    const payload: Partial<JsonRpcReplaceTransactionParams> = {
      transactionId: txParams.transactionId,
      action: txParams.action,
    };

    const { result } = await this.client.replaceTransaction([
      payload,
      {
        gas: hexlify(txParams.gasLimit),
        maxPriorityFeePerGas: hexlify(txParams.maxPriorityFeePerGas),
        maxFeePerGas: hexlify(txParams.maxFeePerGas),
      },
    ]);

    return {
      transactionId: result.transactionId,
    };
  }

  // Gets a Signed Message by Id and returns relevant data
  async getSignedMessage(_address: string, custodian_signedMessageId: string): Promise<ISignatureDetails> {
    const { result } = await this.client.getSignedMessage([custodian_signedMessageId]);

    if (!result) {
      return null;
    }

    return {
      signature: result.signature,
      status: result.status,
    };
  }

  async getTransactionLink(transactionId: string): Promise<Partial<ICustodianTransactionLink>> {
    const { result } = await this.client.getTransactionLink([transactionId]);

    if (!result) {
      return null;
    }

    return {
      url: result.url,
      text: result.text,
      action: result.action,
      ethereum: result.ethereum,
    };
  }

  async getSignedMessageLink(transactionId: string): Promise<Partial<ICustodianTransactionLink>> {
    const { result } = await this.client.getSignedMessageLink([transactionId]);

    if (!result) {
      return null;
    }

    return {
      url: result.url,
      text: result.text,
      action: result.action,
      ethereum: result.ethereum,
    };
  }

  // DEPRECATED
  async getCustomerId(): Promise<string> {
    return null;
  }

  // DEPRECATED
  async getAllTransactions(): Promise<ITransactionDetails[]> {
    // This is no longer a required part of the custodian API
    return null;
  }

  // Obtain a JWT from the custodian that we can use to authenticate to
  public async getCustomerProof(): Promise<string> {
    const { result } = await this.client.getCustomerProof();
    return result.jwt;
  }

  async signTypedData_v4(
    address: string,
    data: TypedMessage<MessageTypes>,
    version: string,
    signedTypedMessageMetadata: SignedTypedMessageMetadata,
  ): Promise<ITransactionDetails> {
    const accounts = await this.getEthereumAccountsByAddress(address);

    if (!accounts.length) {
      throw new Error("No such ethereum account!");
    }

    version = version.toLowerCase();

    const { result } = await this.client.signTypedData([
      {
        address,
        data,
        version,
      },
      signedTypedMessageMetadata,
    ]);

    return {
      custodian_transactionId: result,
      transactionStatus: "created",
      from: address,
    };
  }

  async signPersonalMessage(
    address: string,
    message: string,
    signedMessageMetadata: SignedMessageMetadata,
  ): Promise<ITransactionDetails> {
    const accounts = await this.getEthereumAccountsByAddress(address);

    if (!accounts.length) {
      throw new Error("No such ethereum account!");
    }

    const { result } = await this.client.signPersonalMessage([
      {
        address,
        message,
      },
      signedMessageMetadata,
    ]);

    return {
      custodian_transactionId: result,
      transactionStatus: "created",
      from: accounts[0].address,
    };
  }

  // DEPRECATED
  async getErc20Tokens(): Promise<IMetamaskContractMetadata> {
    return {};
  }

  async getSupportedChains(address: string): Promise<string[]> {
    return this.cache.tryCachingArray<string>("getSupportedChains-" + address, this.cacheAge, async () => {
      const { result } = await this.client.getAccountChainIds([address]);
      return result;
    });
  }

  changeRefreshTokenAuthDetails(authDetails: IRefreshTokenAuthDetails): void {
    this.client.setRefreshToken(authDetails.refreshToken);
  }
}
