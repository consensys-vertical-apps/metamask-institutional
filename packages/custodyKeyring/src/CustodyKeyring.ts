import { EventEmitter } from "events";
import crypto from "crypto";
import { toChecksumAddress } from "ethereumjs-util";
import { FeeMarketEIP1559Transaction, Transaction } from "@ethereumjs/tx";
import { MMISDK } from "@metamask-institutional/sdk";
import {
  ICustodianAccount,
  IExtensionCustodianAccount,
  ITransactionDetails,
  ITransactionStatusMap,
  IMetamaskContractMetadata,
  IEIP1559TxParams,
  ILegacyTXParams,
  AuthTypes,
  AuthDetails,
  IRefreshTokenAuthDetails,
  ITokenAuthDetails,
  ICustodianType,
  ICustodianTransactionLink,
  AddressType,
  ISignatureDetails,
  IRefreshTokenChangeEvent,
  IInteractiveRefreshTokenChangeEvent,
  MetamaskTransaction,
} from "@metamask-institutional/types";
import { MmiConfigurationController } from "./mmiConfiguration";
import {
  DEFAULT_MAX_CACHE_AGE,
  REFRESH_TOKEN_CHANGE_EVENT,
  INTERACTIVE_REPLACEMENT_TOKEN_CHANGE_EVENT,
} from "./constants";
import { ISerializedKeyring } from "./interfaces/ISerializedKeyring";
import { ICustodyKeyringOptions } from "./interfaces/ICustodyKeyringOptions";

import { Migrator } from "./migrations/migrator";
import { migrations } from "./migrations";

export type UniqueAccountDetails = {
  hash: string;
  authDetails: AuthDetails;
  apiUrl: string;
};

export abstract class CustodyKeyring extends EventEmitter {
  public static readonly type;
  public readonly custodianType: ICustodianType; // A reference to the custodian configuration

  public authType: AuthTypes;

  public static addressType: AddressType;

  public type;
  public accounts;
  public selectedAddresses: ICustodianAccount[];
  public accountsDetails: ICustodianAccount[];
  public meta: { version?: number };
  public trackingActiveByCredentials = {};

  public mmiConfigurationController: MmiConfigurationController;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  abstract txDeepLink(custodianDetails: any, txId: string): Promise<Partial<ICustodianTransactionLink> | null>;

  abstract sdkFactory(authDetails: AuthDetails, apiUrl: string): MMISDK;

  protected sdkList: { sdk: MMISDK; hash: string }[];

  constructor(opts: ICustodyKeyringOptions = {}) {
    super();
    this.accounts = [];
    this.selectedAddresses = [];
    this.accountsDetails = [];
    this.sdkList = [];
    this.meta = {};
    this.mmiConfigurationController = opts.mmiConfigurationController;
  }

  getUniqueAccountDetails(account: ICustodianAccount<AuthDetails>): string {
    return this.hashAuthDetails(account.authDetails, account.apiUrl);
  }

  serialize(): Promise<ISerializedKeyring> {
    console.log("Serializing custody keyring");
    return Promise.resolve({
      accounts: this.accounts,
      selectedAddresses: this.selectedAddresses,
      accountsDetails: this.accountsDetails,
      meta: this.meta,
    });
  }

  deserialize(
    opts: {
      accounts?: string[];
      selectedAddresses?: ICustodianAccount[];
      accountsDetails?: ICustodianAccount[];
      meta?: { version?: number };
    } = {},
  ): Promise<void> {
    return new Promise<void>(resolve => {
      const migrator = new Migrator({ migrations });
      const migratedOpts = migrator.migrateData({
        custodianType: this.custodianType,
        type: this.type,
        authType: this.authType,
        ...opts,
      });
      this.accounts = migratedOpts.accounts || [];
      this.selectedAddresses = migratedOpts.selectedAddresses || [];
      this.accountsDetails = migratedOpts.accountsDetails || [];
      this.meta = migratedOpts.meta || {};
      const uniqueAuthDetails: UniqueAccountDetails[] = this.accountsDetails.reduce(
        (result: UniqueAccountDetails[], details) => {
          const hash = this.getUniqueAccountDetails(details);
          if (!result.find(account => hash === account.hash)) {
            result.push({
              hash,
              authDetails: details.authDetails,
              apiUrl: details.apiUrl,
            });
          }
          return result;
        },
        [],
      );
      uniqueAuthDetails.forEach(item => this.getSDK(item.authDetails, item.apiUrl));

      resolve();
    });
  }

  convertExtensionCustodianAccountToSDKCustodianAccount(account: IExtensionCustodianAccount): ICustodianAccount {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { token, ...accountWithoutToken } = account;
    return {
      ...accountWithoutToken,
      address: account.address.toLowerCase(),
      authDetails: this.createAuthDetails(account.token),
    };
  }

  setSelectedAddresses(addresses: IExtensionCustodianAccount[]): void {
    // MMI is agnostic to authType, so it sends
    // from the Custody Compoment (via MetaMaskController.connectCustodyAddresses)
    // a neutral "token" value which we turn into authDetails

    // This will need to be fixed to properly support Authorization Code Flow

    this.selectedAddresses = addresses.map(this.convertExtensionCustodianAccountToSDKCustodianAccount.bind(this));
  }

  addAccounts(n: number): Promise<void> {
    return new Promise(resolve => {
      if (!this.accounts) this.accounts = [];
      for (let i = 0; i < n; i++) {
        const selectedAccountDetails = this.selectedAddresses.shift();
        const address = selectedAccountDetails?.address;
        if (address && !this.accounts.includes(address)) {
          selectedAccountDetails.meta = { version: migrations.length };
          this.accountsDetails.push(selectedAccountDetails);
          this.accounts.push(address);

          // Ensure the SDK is available as soon as the account is added
          this.getSDK(selectedAccountDetails.authDetails, selectedAccountDetails.apiUrl);
        }
      }
      resolve(this.accounts);
    });
  }

  getAccounts() {
    return Promise.resolve(this.accounts);
  }

  removeAccount(address: string): void {
    this.accounts = this.accounts.filter(a => a.toLowerCase() !== address.toLowerCase());
    this.accountsDetails = this.accountsDetails.filter(a => a.address.toLowerCase() !== address.toLowerCase());
  }

  hashAuthDetails(authDetails: AuthDetails, apiUrl: string): string {
    let identifier: string;

    if ((authDetails as ITokenAuthDetails).jwt) {
      identifier = (authDetails as ITokenAuthDetails).jwt + apiUrl;
    } else if ((authDetails as IRefreshTokenAuthDetails).refreshToken) {
      identifier = (authDetails as IRefreshTokenAuthDetails).refreshToken + apiUrl;
    }

    return crypto.createHash("sha256").update(identifier).digest("hex");
  }

  // This is for "top-down" token refreshes (from the extension)
  // This allows the API URL to be changed
  replaceRefreshTokenAuthDetails(address: string, newAuthDetails: IRefreshTokenAuthDetails): void {
    const { authDetails, apiUrl } = this.getAccountDetails(address);
    const sdk = this.getSDK(authDetails, apiUrl);

    sdk.changeRefreshTokenAuthDetails(newAuthDetails);
  }

  updateAccountsDetailsWithNewRefreshToken(oldRefreshToken: string, newRefreshToken: string, oldApiUrl: string) {
    for (const account of this.accountsDetails) {
      const authDetails = account.authDetails as IRefreshTokenAuthDetails;
      if ((authDetails as IRefreshTokenAuthDetails).refreshToken === oldRefreshToken && account.apiUrl === oldApiUrl) {
        authDetails.refreshToken = newRefreshToken;
      }
    }
  }

  handleRefreshTokenChangeEvent(event: IRefreshTokenChangeEvent, apiUrl: string): void {
    this.updateAccountsDetailsWithNewRefreshToken(event.oldRefreshToken, event.newRefreshToken, apiUrl);

    const payload: IRefreshTokenChangeEvent = {
      oldRefreshToken: event.oldRefreshToken,
      newRefreshToken: event.newRefreshToken,
    };

    this.emit(REFRESH_TOKEN_CHANGE_EVENT, payload); // Propagate the event to the extension where it calls for the keyrings to be persisted
  }

  handleInteractiveRefreshTokenChangeEvent(event: IInteractiveRefreshTokenChangeEvent): void {
    this.emit(INTERACTIVE_REPLACEMENT_TOKEN_CHANGE_EVENT, event); // Propagate the event to the extension where it calls for the keyrings to be persisted
  }

  createAuthDetails(token: string): AuthDetails {
    let authDetails: AuthDetails;

    if (this.authType === AuthTypes.TOKEN) {
      authDetails = {
        jwt: token,
      };
    } else if (this.authType === AuthTypes.REFRESH_TOKEN) {
      authDetails = {
        refreshToken: token,
      };
    }

    return authDetails;
  }

  getSDK(authDetails: AuthDetails, apiUrl?: string): MMISDK {
    const hash = this.hashAuthDetails(authDetails, apiUrl);

    // Interesting thing - this will create a new SDK if the auth details are changed
    // What are the possible effects of this?

    const found = this.sdkList.find(item => item.hash === hash);

    if (found) {
      return found.sdk;
    }

    const sdk = this.sdkFactory(authDetails, apiUrl);

    sdk.on(REFRESH_TOKEN_CHANGE_EVENT, (event: IRefreshTokenChangeEvent) =>
      this.handleRefreshTokenChangeEvent(event, apiUrl),
    );

    sdk.on(INTERACTIVE_REPLACEMENT_TOKEN_CHANGE_EVENT, (event: IInteractiveRefreshTokenChangeEvent) =>
      this.handleInteractiveRefreshTokenChangeEvent(event),
    );

    this.sdkList.push({
      sdk,
      hash,
    });

    return sdk;
  }

  async getCustodianAccounts(
    token: string,
    apiUrl: string,
    searchText?: string,
    getNonImportedAccounts = true,
  ): Promise<ICustodianAccount<AuthDetails>[]> {
    const authDetails = this.createAuthDetails(token);
    const sdk = this.getSDK(authDetails, apiUrl);

    let accounts;
    if (searchText) {
      if (searchText.startsWith("0x")) {
        accounts = await sdk.getEthereumAccountsByAddress(searchText, DEFAULT_MAX_CACHE_AGE);
      } else {
        accounts = await sdk.getEthereumAccountsByLabelOrAddressName(searchText, DEFAULT_MAX_CACHE_AGE);
      }
    } else {
      accounts = await sdk.getEthereumAccounts(DEFAULT_MAX_CACHE_AGE);
    }

    if (getNonImportedAccounts) {
      return accounts.filter(
        account => this.accounts.map(addr => addr.toLowerCase()).indexOf(account.address.toLowerCase()) === -1,
      );
    }

    return accounts.filter(
      account => this.accounts.map(addr => addr.toLowerCase()).indexOf(account.address.toLowerCase()) !== -1,
    );
  }

  getTransactionNote(txMeta: MetamaskTransaction): string {
    const mapping = {
      contractInteraction: "Contract Interaction",
      contractDeployment: "Contract Deployment",
      transfer: "ETH Transfer",
      swap: "Metamask Swap",
      approve: "Token Approval",
    };

    const readableCategory = mapping[txMeta.type] || txMeta.type;

    return txMeta?.metadata?.note || `${readableCategory} - initiated on ${txMeta.origin}`;
  }

  // tx is an instance of the ethereumjs-transaction class.
  async signTransaction(
    fromAddress: string,
    ethTx: FeeMarketEIP1559Transaction | Transaction,
    txMeta: MetamaskTransaction,
  ): Promise<ITransactionDetails> {
    const note = this.getTransactionNote(txMeta);

    let data: any;
    if (typeof ethTx.data === "string") {
      data = ethTx.data;
    } else if (ethTx.data instanceof Uint8Array) {
      data = ethTx.data.toString("hex");
    }

    if (!data?.length) {
      data = undefined;
    } else if (!data?.startsWith("0x")) {
      data = "0x" + data;
    }

    const { authDetails, apiUrl } = this.getAccountDetails(fromAddress);
    const sdk = this.getSDK(authDetails, apiUrl);

    const noGasPayload: any = {
      from: toChecksumAddress(fromAddress),
      value: BigInt(txMeta.txParams.value).toString(),
      gasLimit: BigInt(txMeta.txParams.gas).toString(),
      data: data,
    };

    // Contract deployments have no to address
    if (txMeta.txParams.to) {
      noGasPayload.to = toChecksumAddress(txMeta.txParams.to);
    }

    const eip1559 = (txMeta.txParams as IEIP1559TxParams).maxFeePerGas;

    const chainId = Number(txMeta.chainId).toString(10); // Convert to string to avoid weirdness with BigInt

    const supportedChainIds = await sdk.getSupportedChains(fromAddress);

    // JSON-RPC chains are hexlified
    const normalisedSupportedChainIds = supportedChainIds.map(chainId => Number(chainId).toString());

    if (!normalisedSupportedChainIds.includes(chainId)) {
      throw new Error(`This network ${chainId} is not supported by ${this.custodianType.name}`);
    }

    let payload: IEIP1559TxParams | ILegacyTXParams;

    if (eip1559) {
      payload = {
        ...noGasPayload,
        maxFeePerGas: BigInt((txMeta.txParams as IEIP1559TxParams).maxFeePerGas).toString(),
        maxPriorityFeePerGas: BigInt((txMeta.txParams as IEIP1559TxParams).maxPriorityFeePerGas).toString(),
        type: "2",
      } as IEIP1559TxParams;
    } else {
      payload = {
        ...noGasPayload,
        gasPrice: BigInt((txMeta.txParams as ILegacyTXParams).gasPrice).toString(),
        type: "0",
      } as ILegacyTXParams;
    }

    const result = await sdk.createTransaction(payload, {
      chainId,
      note,
      transactionCategory: txMeta.type,
      origin: txMeta.origin,
    });

    return result;
  }

  getAllAccountsWithToken(token: string): ICustodianAccount[] {
    return this.accountsDetails.filter(
      item =>
        (item.authDetails as ITokenAuthDetails)?.jwt === token ||
        (item.authDetails as IRefreshTokenAuthDetails)?.refreshToken === token,
    );
  }

  async getTransaction(from: string, txCustodyId: string): Promise<ITransactionDetails> {
    if (from === undefined || txCustodyId === undefined) {
      return null;
    }

    const { authDetails, apiUrl } = this.getAccountDetails(from);
    const sdk = this.getSDK(authDetails, apiUrl);
    const tx = await sdk.getTransaction(toChecksumAddress(from), txCustodyId);
    return tx;
  }

  async getTransactionDeepLink(address: string, txId: string): Promise<Partial<ICustodianTransactionLink>> {
    return this.txDeepLink(address, txId);
  }

  getAccountDetails(address: string): ICustodianAccount {
    return this.accountsDetails.find(account => account.address.toLowerCase() === address.toLowerCase());
  }

  // TODO: This methods should be rename 'get signed message'

  async getSignature(address: string, signatureId: string): Promise<ISignatureDetails> {
    if (signatureId === undefined) {
      return null;
    }

    const { authDetails, apiUrl } = this.getAccountDetails(address);
    const sdk = this.getSDK(authDetails, apiUrl);

    const signature = await sdk.getSignature(toChecksumAddress(address), signatureId);

    return signature;
  }

  async signPersonalMessage(address: string, message: string, _opts = {}): Promise<ITransactionDetails> {
    const { authDetails, apiUrl } = this.getAccountDetails(address);
    const sdk = this.getSDK(authDetails, apiUrl);

    return sdk.signPersonalMessage(address, message);
  }

  signMessage() {
    throw new Error("Not supported on this custodian");
  }

  exportAccount() {
    throw new Error("Not supported on this custodian");
  }

  async getErc20Tokens(): Promise<IMetamaskContractMetadata> {
    let tokenContracts = {};

    for (const { sdk } of this.sdkList) {
      const tokens = await sdk.getErc20Tokens();
      tokenContracts = { ...tokenContracts, tokens };
    }

    return tokenContracts;
  }

  abstract getStatusMap(): ITransactionStatusMap;

  async getCustomerProof(address: string): Promise<string> {
    const { authDetails, apiUrl } = this.getAccountDetails(address);
    const sdk = this.getSDK(authDetails, apiUrl);

    return sdk.getCustomerProof();
  }

  async signTypedData(address: string, data: any, opts: any): Promise<ITransactionDetails> {
    // Explanation : signTypedDataV4 also works for V3 (the standard is backward compatible)
    // However, the custodian will treat it as V4, so we continue to name the SDK methods V4
    if (opts.version !== "V4" && opts.version !== "V3") {
      this.emit("error", "Only signedTypedData_v4 and signedTypedData_v3 is supported");
    }

    const { authDetails, apiUrl } = this.getAccountDetails(address);
    const sdk = this.getSDK(authDetails, apiUrl);

    return sdk.signedTypedData_v4(address, data, opts.version);
  }

  getSupportedChains(address: string): Promise<string[]> {
    const { authDetails, apiUrl } = this.getAccountDetails(address);
    const sdk = this.getSDK(authDetails, apiUrl);
    return sdk.getSupportedChains(address);
  }
}
