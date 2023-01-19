import { CustodyKeyring } from "../../classes/CustodyKeyring";
import { ICustodyKeyringOptions } from "../../interfaces/ICustodyKeyringOptions";
import { ITransactionStatusMap } from "../../interfaces/ITransactionStatusMap";
import { JupiterStatusMap } from "./JupiterStatusMap";
import { JupiterCustodianApi } from "./JupiterCustodianApi";
import { mmiSDKFactory } from "../../util/mmi-sdk-factory";
import { AuthDetails } from "../../types/AuthDetails";
import { MMISDK } from "../..";
import { AuthTypes } from "../../enum/AuthTypes";
import { CUSTODIAN_TYPES } from "..";
import { AddressType } from "../../enum/AddressType";
import { ICustodianTransactionLink } from "../../interfaces/ICustodian";

export class JupiterCustodyKeyring extends CustodyKeyring {
  public static readonly type = "Custody - Jupiter";
  public type = "Custody - Jupiter";

  public authType = AuthTypes.TOKEN;

  public static addressType: AddressType.POLYCHAIN;

  public readonly custodianType = CUSTODIAN_TYPES.JUPITER;

  sdkFactory = (authDetails: AuthDetails, apiUrl: string): MMISDK =>
    mmiSDKFactory(JupiterCustodianApi, authDetails, this.authType, apiUrl);

  txDeepLink = async (address: string, txId) => {
    // Currently the Jupiter custody UI has no transaction dialog, but one has been asked for
    // https://consensys.slack.com/archives/C02F5G7SZU1/p1634735561046100

    const { apiUrl } = this.getAccountDetails(address);

    const transactionLink: Partial<ICustodianTransactionLink> = {
      text:
        "Approve the transaction in the Jupiter Custody app. Once all required custody approvals have been performed the transaction will complete. Check your Jupiter Custody app for status.",
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
