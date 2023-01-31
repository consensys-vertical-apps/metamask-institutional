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

export class CactusCustodyKeyring extends CustodyKeyring {
  public static readonly type = "Custody - Cactus";
  public type = "Custody - Cactus";

  public readonly custodianType = {
    name: "Cactus",
    displayName: "Cactus Custody",
    apiUrl: "https://api.mycactus.com/custody/v1/mmi-api",
    imgSrc: "images/cactus.svg",
    icon: "images/cactus.svg",
    keyringClass: CactusCustodyKeyring,
    production: true,
    hidden: false,
    origins: [],
    environmentMapping: [
      {
        pattern: /^.*$/u,
        mmiApiUrl: "https://mmi.codefi.network/v1",
      },
      {
        pattern: /^https:\/\/api.mycactus.com/u,
        mmiApiUrl: "https://api.mmi-prod.codefi.network/v1",
      },
    ],
  };

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
