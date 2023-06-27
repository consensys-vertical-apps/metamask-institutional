import { JsonRpcCustodianApi, MMISDK, mmiSDKFactory } from "@metamask-institutional/sdk";
import {
  AddressType,
  AuthTypes,
  ICustodianTransactionLink,
  IRefreshTokenAuthDetails,
  ITransactionStatusMap,
} from "@metamask-institutional/types";

import { CustodyKeyring } from "../../CustodyKeyring";
import { ICustodyKeyringOptions } from "../../interfaces/ICustodyKeyringOptions";
import { JsonRpcStatusMap } from "./JsonRpcStatusMap";

export class JsonRpcCustodyKeyring extends CustodyKeyring {
  public static readonly type = "Custody - JSONRPC";
  public type = "Custody - JSONRPC";

  public authType = AuthTypes.REFRESH_TOKEN;

  public static addressType: AddressType.POLYCHAIN;

  public readonly custodianType = {
    name: "JSONRPC",
    displayName: "JSON-RPC",
    apiUrl: "https://saturn-custody.codefi.network/eth",
    imgSrc: "https://saturn-custody-ui.metamask-institutional.io/saturn.svg",
    icon: "https://saturn-custody-ui.metamask-institutional.io/saturn.svg",
    keyringClass: JsonRpcCustodyKeyring,
    production: false,
    hidden: true, // Since this is the prototype, we don't want to show it in the UI
    origins: [],
    environmentMapping: [], // No environment mapping for JSON-RPC custodians as this is derived from the configuration service
  };

  sdkFactory = (authDetails: IRefreshTokenAuthDetails, apiUrl: string): MMISDK => {
    const store = this.mmiConfigurationController.store.getState();

    const { custodians } = store.mmiConfiguration;

    const custodian = custodians.find(c => c.apiUrl === apiUrl);

    if (!custodian) {
      throw new Error(`Could not find custodian with URL: ${apiUrl} - please contact support`);
    }

    authDetails.refreshTokenUrl = custodian.refreshTokenUrl;

    return mmiSDKFactory(JsonRpcCustodianApi, authDetails, this.authType, apiUrl);
  };

  txDeepLink = async (address: string, txId: string): Promise<Partial<ICustodianTransactionLink>> => {
    const { authDetails, apiUrl } = this.getAccountDetails(address);

    const sdk = this.getSDK(authDetails, apiUrl);

    try {
      const transactionLink = await sdk.getTransactionLink(txId);

      return transactionLink;
    } catch (e) {
      console.log(`Unable to get transction link for ${txId}`);
      console.log(e);
      return null;
    }
  };

  constructor(opts: ICustodyKeyringOptions = {}) {
    super(opts);
  }

  getStatusMap(): ITransactionStatusMap {
    return JsonRpcStatusMap;
  }
}
