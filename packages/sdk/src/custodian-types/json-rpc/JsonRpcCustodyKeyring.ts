import { CustodyKeyring } from "../../classes/CustodyKeyring";
import { ICustodyKeyringOptions } from "../../interfaces/ICustodyKeyringOptions";
import { ITransactionStatusMap } from "../../interfaces/ITransactionStatusMap";
import { JsonRpcStatusMap } from "./JsonRpcStatusMap";
import { JsonRpcCustodianApi } from "./JsonRpcCustodianApi";
import { mmiSDKFactory } from "../../util/mmi-sdk-factory";
import { MMISDK } from "../..";
import { AuthTypes } from "../../enum/AuthTypes";
import { CUSTODIAN_TYPES } from "..";
import { AddressType } from "../../enum/AddressType";
import { IRefreshTokenAuthDetails } from "../../interfaces/auth/IRefreshTokenAuthDetails";
import { ICustodianTransactionLink } from "../../interfaces/ICustodian";

export class JsonRpcCustodyKeyring extends CustodyKeyring {
  public static readonly type = "Custody - JSONRPC";
  public type = "Custody - JSONRPC";

  public authType = AuthTypes.REFRESH_TOKEN;

  public static addressType: AddressType.POLYCHAIN;

  public readonly custodianType = CUSTODIAN_TYPES.JSONRPC;

  sdkFactory = (
    authDetails: IRefreshTokenAuthDetails,
    apiUrl: string
  ): MMISDK => {
    const store = this.mmiConfigurationController.store.getState();

    const { custodians } = store.mmiConfiguration;

    const custodian = custodians.find((c) => c.apiUrl === apiUrl);

    if (!custodian) {
      throw new Error(
        `Could not find custodian with URL: ${apiUrl} - please contact support`
      );
    }

    authDetails.refreshTokenUrl = custodian.refreshTokenUrl;

    return mmiSDKFactory(
      JsonRpcCustodianApi,
      authDetails,
      this.authType,
      apiUrl
    );
  };

  txDeepLink = async (
    address: string,
    txId: string
  ): Promise<Partial<ICustodianTransactionLink>> => {
    const { authDetails, apiUrl } = this.getAccountDetails(address);

    const sdk = this.getSDK(authDetails, apiUrl);

    try {
      const transactionLink = await sdk.getTransactionLink(txId);

      return transactionLink;
    } catch (e) {
      console.error(`Unable to get transction link for ${txId}`);
      console.error(e);
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
