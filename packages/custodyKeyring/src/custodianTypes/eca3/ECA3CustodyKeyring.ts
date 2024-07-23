import { ECA3CustodianApi, MMISDK, mmiSDKFactory } from "@metamask-institutional/sdk";
import {
  AddressType,
  AuthTypes,
  ICustodianTransactionLink,
  IRefreshTokenAuthDetails,
  ITransactionStatusMap,
} from "@metamask-institutional/types";

import { CustodyKeyring } from "../../CustodyKeyring";
import { ICustodyKeyringOptions } from "../../interfaces/ICustodyKeyringOptions";
import { ECA3StatusMap } from "./ECA3StatusMap";

export class ECA3CustodyKeyring extends CustodyKeyring {
  public static readonly type = "Custody - ECA3";
  public type = "Custody - ECA3";

  public authType = AuthTypes.REFRESH_TOKEN;

  public static addressType: AddressType.POLYCHAIN;

  public readonly custodianType = {
    name: "ECA3",
    displayName: "ECA3",
    apiUrl: "https://neptune-custody.codefi.network/eth",
    imgSrc: "https://backend.vistan-brillen.de/storage/files/images/marken/changeme/header/changeme-logo-header.jpg",
    iconUrl: "https://backend.vistan-brillen.de/storage/files/images/marken/changeme/header/changeme-logo-header.jpg",
    website: "https://neptune-custody-ui.metamask-institutional.io/",
    onboardingUrl: "https://neptune-custody-ui.metamask-institutional.io/",
    envName: "neptune-custody",
    keyringClass: ECA3CustodyKeyring,
    production: false,
    hidden: true, // Since this is the prototype, we don't want to show it in the UI
    origins: [],
    environmentMapping: [], // No environment mapping for JSON-RPC custodians as this is derived from the configuration service
  };

  sdkFactory = (authDetails: IRefreshTokenAuthDetails, envName: string): MMISDK => {
    const { refreshTokenUrl, apiUrl } = this.getCustodianFromEnvName(envName);

    authDetails.refreshTokenUrl = refreshTokenUrl;

    return mmiSDKFactory(ECA3CustodianApi, authDetails, this.authType, apiUrl);
  };

  txDeepLink = async (address: string, txId: string): Promise<Partial<ICustodianTransactionLink>> => {
    const { authDetails, envName } = this.getAccountDetails(address);

    const sdk = this.getSDK(authDetails, envName);

    try {
      const transactionLink = await sdk.getTransactionLink(txId);

      return transactionLink;
    } catch (e) {
      console.log(`Unable to get transction link for ${txId}`);
      return null;
    }
  };

  constructor(opts: ICustodyKeyringOptions = {}) {
    super(opts);
  }

  getStatusMap(): ITransactionStatusMap {
    return ECA3StatusMap;
  }
}
