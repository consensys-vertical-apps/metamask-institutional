import {
  ITransactionStatusMap,
  AuthDetails,
  AuthTypes,
  ICustodianTransactionLink,
} from "@metamask-institutional/types";
import { BitgoCustodianApi, mmiSDKFactory, MMISDK } from "@metamask-institutional/sdk";
import { CustodyKeyring } from "../../CustodyKeyring";
import { ICustodyKeyringOptions } from "../../interfaces/ICustodyKeyringOptions";
import { BitgoStatusMap } from "./BitgoStatusMap";
import { CUSTODIAN_TYPES } from "..";

export class BitgoCustodyKeyring extends CustodyKeyring {
  public static readonly type = "Custody - Bitgo";
  public type = "Custody - Bitgo";

  public authType = AuthTypes.TOKEN;

  public readonly custodianType = CUSTODIAN_TYPES.BITGO;

  sdkFactory = (authDetails: AuthDetails, apiUrl: string): MMISDK =>
    mmiSDKFactory(BitgoCustodianApi, authDetails, this.authType, apiUrl);

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
