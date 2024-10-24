import { BitgoCustodianApi, MMISDK, mmiSDKFactory } from "@metamask-institutional/sdk";
import {
  AuthDetails,
  AuthTypes,
  ICustodianTransactionLink,
  ITransactionStatusMap,
} from "@metamask-institutional/types";

import { CustodyKeyring } from "../../CustodyKeyring";
import { ICustodyKeyringOptions } from "../../interfaces/ICustodyKeyringOptions";
import { BitgoStatusMap } from "./BitgoStatusMap";

export class BitgoCustodyKeyring extends CustodyKeyring {
  public static readonly type = "Custody - Bitgo";
  public type = "Custody - Bitgo";

  public authType = AuthTypes.TOKEN;

  public readonly custodianType = {
    name: "Bitgo",
    displayName: "BitGo",
    apiUrl: "https://app.bitgo.com/defi/v2",
    imgSrc: "https://dashboard.metamask-institutional.io/custodian-icons/bitgo-icon.svg",
    iconUrl: "https://dashboard.metamask-institutional.io/custodian-icons/bitgo-icon.svg",
    website: "https://www.bitgo.com",
    onboardingUrl: "https://www.bitgo.com",
    envName: "bitgo",
    keyringClass: BitgoCustodyKeyring,
    production: true,
    hidden: false,
    origins: [],
    environmentMapping: [
      {
        pattern: /^.*$/u,
        mmiApiUrl: "https://mmi.codefi.network/v1",
      },
      {
        pattern: /^https:\/\/app.bitgo-test.com/u,
        mmiApiUrl: "https://mmi.codefi.network/v1",
      },
      {
        pattern: /^https:\/\/app.bitgo.com/u,
        mmiApiUrl: "https://api.mmi-prod.codefi.network/v1",
      },
    ],
  };

  sdkFactory = (authDetails: AuthDetails, envName: string): MMISDK => {
    const custodianEnvName = envName !== "bitgo" ? "bitgo-test" : "bitgo";
    const custodian = this.getCustodianFromEnvName(custodianEnvName);

    return mmiSDKFactory(BitgoCustodianApi, authDetails, this.authType, custodian.apiUrl);
  };

  txDeepLink = async (_custodianDetails, _txId) => {
    const transactionLink: Partial<ICustodianTransactionLink> = {
      text: "Approve and sign the transaction in BitGo. Once all required approvals have been performed, the transaction will complete. Check your BitGo wallet for the latest status.",
      url: null,
    };

    return transactionLink;
  };

  constructor(opts: ICustodyKeyringOptions = {}) {
    super(opts);
  }

  getStatusMap(): ITransactionStatusMap {
    return BitgoStatusMap;
  }
}
