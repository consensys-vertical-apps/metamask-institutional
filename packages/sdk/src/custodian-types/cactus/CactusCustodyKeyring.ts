import { CustodyKeyring } from "../../classes/CustodyKeyring";
import { ICustodyKeyringOptions } from "../../interfaces/ICustodyKeyringOptions";
import { ITransactionStatusMap } from "../../interfaces/ITransactionStatusMap";
import { CactusStatusMap } from "./CactusStatusMap";
import { CactusCustodianApi } from "./CactusCustodianApi";
import { mmiSDKFactory } from "../../util/mmi-sdk-factory";
import { MMISDK } from "../..";
import { AuthTypes } from "../../enum/AuthTypes";
import { CUSTODIAN_TYPES } from "..";
import { IRefreshTokenAuthDetails } from "../../interfaces/auth/IRefreshTokenAuthDetails";
import { AddressType } from "../../enum/AddressType";
import { ICustodianTransactionLink } from "src/interfaces/ICustodian";

export class CactusCustodyKeyring extends CustodyKeyring {
  public static readonly type = "Custody - Cactus";
  public type = "Custody - Cactus";

  public readonly custodianType = CUSTODIAN_TYPES.CACTUS;

  public authType = AuthTypes.REFRESH_TOKEN;

  public static addressType: AddressType.POLYCHAIN;

  sdkFactory = (
    authDetails: IRefreshTokenAuthDetails,
    apiUrl: string
  ): MMISDK =>
    mmiSDKFactory(CactusCustodianApi, authDetails, this.authType, apiUrl);

  txDeepLink = async (
    _custodianDetails,
    _txId
  ): Promise<Partial<ICustodianTransactionLink>> => {
    const transactionLink: Partial<ICustodianTransactionLink> = {
      text: null,
      url: "https://www.mycactus.com/cactus/login",
    };

    return transactionLink;
  };

  constructor(opts: ICustodyKeyringOptions = {}) {
    super(opts);
  }

  getStatusMap(): ITransactionStatusMap {
    return CactusStatusMap;
  }
}
