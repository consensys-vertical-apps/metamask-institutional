import {
  ITransactionStatusMap,
  AuthTypes,
  IRefreshTokenAuthDetails,
  AddressType,
  ICustodianTransactionLink,
} from "@metamask-institutional/types";
import { mmiSDKFactory, MMISDK, CactusCustodianApi } from "@metamask-institutional/sdk";
import { CustodyKeyring } from "../../CustodyKeyring";
import { ICustodyKeyringOptions } from "../../interfaces/ICustodyKeyringOptions";
import { CactusStatusMap } from "./CactusStatusMap";

import { CUSTODIAN_TYPES } from "..";

export class CactusCustodyKeyring extends CustodyKeyring {
  public static readonly type = "Custody - Cactus";
  public type = "Custody - Cactus";

  public readonly custodianType = CUSTODIAN_TYPES.CACTUS;

  public authType = AuthTypes.REFRESH_TOKEN;

  public static addressType: AddressType.POLYCHAIN;

  sdkFactory = (authDetails: IRefreshTokenAuthDetails, apiUrl: string): MMISDK =>
    mmiSDKFactory(CactusCustodianApi, authDetails, this.authType, apiUrl);

  txDeepLink = async (_custodianDetails, _txId): Promise<Partial<ICustodianTransactionLink>> => {
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
