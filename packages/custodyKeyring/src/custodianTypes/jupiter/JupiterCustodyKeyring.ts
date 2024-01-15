import { JupiterCustodianApi, MMISDK, mmiSDKFactory } from "@metamask-institutional/sdk";
import {
  AddressType,
  AuthDetails,
  AuthTypes,
  ICustodianTransactionLink,
  ITransactionStatusMap,
} from "@metamask-institutional/types";

import { CustodyKeyring } from "../../CustodyKeyring";
import { ICustodyKeyringOptions } from "../../interfaces/ICustodyKeyringOptions";
import { JupiterStatusMap } from "./JupiterStatusMap";

export class JupiterCustodyKeyring extends CustodyKeyring {
  public static readonly type = "Custody - Jupiter";
  public type = "Custody - Jupiter";

  public authType = AuthTypes.TOKEN;

  public static addressType: AddressType.POLYCHAIN;

  public readonly custodianType = {
    name: "Jupiter",
    displayName: "Jupiter Custody",
    apiUrl: "https://jupiter-custody.codefi.network",
    imgSrc: "images/jupiter.svg",
    icon: "images/jupiter.svg",
    website: "",
    onboardingUrl: "",
    envName: "",
    keyringClass: JupiterCustodyKeyring,
    production: true,
    hidden: false,
    origins: [/^https:\/\/jupiter-custody-ui.codefi.network\//],
    environmentMapping: [
      {
        pattern: /^http:\/\/test-pattern/,
        mmiApiUrl: "http://test-url",
      },
      {
        pattern: /^http:\/\/localhost.*$/,
        mmiApiUrl: "http://localhost:3000/v1",
      },
    ],
  };

  sdkFactory = (authDetails: AuthDetails, envName: string): MMISDK => {
    const { apiUrl } = this.getCustodianFromEnvName(envName);
    return mmiSDKFactory(JupiterCustodianApi, authDetails, this.authType, apiUrl);
  };

  txDeepLink = async (address: string, txId) => {
    // Currently the Jupiter custody UI has no transaction dialog, but one has been asked for
    // https://consensys.slack.com/archives/C02F5G7SZU1/p1634735561046100

    const { apiUrl } = this.getAccountDetails(address);

    const transactionLink: Partial<ICustodianTransactionLink> = {
      text: "Approve the transaction in the Jupiter Custody app. Once all required custody approvals have been performed the transaction will complete. Check your Jupiter Custody app for status.",
      url: null,
    };

    if (apiUrl && apiUrl.includes("-demo")) {
      transactionLink.url = `https://jupiter-custody-ui-demo.codefi.network/${txId}`;
    }

    return transactionLink;
  };

  constructor(opts: ICustodyKeyringOptions = {}) {
    super(opts);
  }

  getStatusMap(): ITransactionStatusMap {
    return JupiterStatusMap;
  }
}
