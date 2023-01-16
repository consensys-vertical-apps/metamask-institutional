import { CustodyKeyring } from "../../classes/CustodyKeyring";
import { ICustodyKeyringOptions } from "../../interfaces/ICustodyKeyringOptions";
import { ITransactionStatusMap } from "../../interfaces/ITransactionStatusMap";
import { QredoStatusMap } from "./QredoStatusMap";
import { QredoCustodianApi } from "./QredoCustodianApi";
import { mmiSDKFactory } from "../../util/mmi-sdk-factory";
import { MMISDK } from "../..";
import { IRefreshTokenAuthDetails } from "../../interfaces/auth/IRefreshTokenAuthDetails";
import { AuthTypes } from "../../enum/AuthTypes";
import { CUSTODIAN_TYPES } from "..";
import { AddressType } from "../../enum/AddressType";
import { ICustodianTransactionLink } from "../../interfaces/ICustodian";

export class QredoCustodyKeyring extends CustodyKeyring {
  public static readonly type = "Custody - Qredo";
  public type = "Custody - Qredo";

  public readonly custodianType = CUSTODIAN_TYPES.QREDO;

  public authType = AuthTypes.REFRESH_TOKEN;

  public static addressType: AddressType.POLYCHAIN;

  sdkFactory = (
    authDetails: IRefreshTokenAuthDetails,
    apiUrl: string
  ): MMISDK =>
    mmiSDKFactory(QredoCustodianApi, authDetails, this.authType, apiUrl);

  txDeepLink = async (
    _address: string,
    _txId: string
  ): Promise<Partial<ICustodianTransactionLink>> => {
    return null;
  };

  constructor(opts: ICustodyKeyringOptions = {}) {
    super(opts);
  }

  getStatusMap(): ITransactionStatusMap {
    return QredoStatusMap;
  }
}
