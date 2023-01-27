import {
  ITransactionStatusMap,
  IRefreshTokenAuthDetails,
  AuthTypes,
  AddressType,
  ICustodianTransactionLink,
} from "@metamask-institutional/types";
import { QredoCustodianApi, mmiSDKFactory, MMISDK } from "@metamask-institutional/sdk";
import { CustodyKeyring } from "../../CustodyKeyring";
import { ICustodyKeyringOptions } from "../../interfaces/ICustodyKeyringOptions";
import { QredoStatusMap } from "./QredoStatusMap";

export class QredoCustodyKeyring extends CustodyKeyring {
  public static readonly type = "Custody - Qredo";
  public type = "Custody - Qredo";

  public readonly custodianType = {
    name: "Qredo",
    displayName: "Qredo",
    apiUrl: "https://api.qredo.network",
    imgSrc: "images/qredo.svg",
    icon: "images/qredo.svg",
    keyringClass: QredoCustodyKeyring,
    production: true,
    hidden: false,
    origins: [],
    environmentMapping: [
      {
        pattern: /^.*$/u,
        mmiApiUrl: "https://mmi.codefi.network/v1",
      },
      {
        pattern: /^https:\/\/api.qredo.network/u,
        mmiApiUrl: "https://api.mmi-prod.codefi.network/v1",
      },
    ],
  };

  public authType = AuthTypes.REFRESH_TOKEN;

  public static addressType: AddressType.POLYCHAIN;

  sdkFactory = (authDetails: IRefreshTokenAuthDetails, apiUrl: string): MMISDK =>
    mmiSDKFactory(QredoCustodianApi, authDetails, this.authType, apiUrl);

  txDeepLink = async (_address: string, _txId: string): Promise<Partial<ICustodianTransactionLink>> => {
    return null;
  };

  constructor(opts: ICustodyKeyringOptions = {}) {
    super(opts);
  }

  getStatusMap(): ITransactionStatusMap {
    return QredoStatusMap;
  }
}
