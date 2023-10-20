import { CurvCustodianApi, mmiSDKFactory } from "@metamask-institutional/sdk";
import { AuthDetails, AuthTypes, ITokenAuthDetails, ITransactionStatusMap } from "@metamask-institutional/types";

import { CustodyKeyring } from "../../CustodyKeyring";
import { ICustodyKeyringOptions } from "../../interfaces/ICustodyKeyringOptions";

interface Label {
  key: string;
  value: string;
}

interface ICustodianAccountProto {
  name?: string;
  address: string;
  custodianDetails: any;
  labels: Label[];
  apiUrl: string;
  chainId?: number;
  custodyType: string;
  meta?: { version: number };
}

// The type actually used in CustodyKeyring

export interface ICustodianAccount<T extends AuthDetails = AuthDetails> extends ICustodianAccountProto {
  authDetails: T;
}

// The type that's used in the extension, which is agnostic to authType

export interface IExtensionCustodianAccount extends ICustodianAccountProto {
  token: string; // TODO
}

// The type that's used in old CurvCustodyKeyrings

export interface ILegacyCustodianAccount extends ICustodianAccountProto {
  jwt: string; // Old pre-refactor property
}

export class CurvCustodyKeyring extends CustodyKeyring {
  public static readonly type = "Custody - Curv";
  public readonly custodianType = {
    name: "Curv",
    displayName: "Curv",
    apiUrl: "https://app.curv.co",
    imgSrc: "images/curv-logo-horizontal-black.svg",
    icon: "images/curv-logo.svg",
    website: "",
    envName: "",
    keyringClass: CurvCustodyKeyring,
    production: false,
    hidden: true,
    origins: [],
    environmentMapping: [],
  };
  public authType = AuthTypes.TOKEN;

  public type = "Custody - Curv";
  apiUrlKey = "curvApiUrl";

  public selectedAddresses: ICustodianAccount<ITokenAuthDetails>[];
  public accountsDetails: ICustodianAccount<ITokenAuthDetails>[];

  sdkFactory = (authDetails: AuthDetails, apiUrl: string) =>
    mmiSDKFactory(CurvCustodianApi, authDetails, this.authType, apiUrl);

  // For AccountDetails that still contain `jwt` property
  handleLegacyAccountDetails(
    detailsArray: ICustodianAccount<ITokenAuthDetails>[] | ILegacyCustodianAccount[],
  ): ICustodianAccount[] {
    return detailsArray.map((details: ICustodianAccount<ITokenAuthDetails> | ILegacyCustodianAccount) => {
      let authDetails: ITokenAuthDetails;

      if ((details as ILegacyCustodianAccount).jwt) {
        authDetails = {
          jwt: (details as ILegacyCustodianAccount).jwt,
        };
      } else {
        authDetails = (details as ICustodianAccount<ITokenAuthDetails>).authDetails;
      }

      return {
        name: details.name,
        address: details.address,
        custodianDetails: details.custodianDetails,
        labels: details.labels,
        apiUrl: details.apiUrl,
        chainId: details.chainId,
        custodyType: details.custodyType,
        authDetails,
      };
    });
  }

  deserialize(
    opts: {
      accounts?: string[];
      selectedAddresses?: ICustodianAccount[] | ILegacyCustodianAccount[];
      accountsDetails?: ICustodianAccount[] | ILegacyCustodianAccount[];
      meta?: { version?: number };
    } = {},
  ): Promise<void> {
    return super.deserialize({
      accounts: opts.accounts || [],
      selectedAddresses: opts.selectedAddresses
        ? this.handleLegacyAccountDetails(opts.selectedAddresses as ILegacyCustodianAccount[])
        : [],
      accountsDetails: opts.accountsDetails
        ? this.handleLegacyAccountDetails(opts.accountsDetails as ILegacyCustodianAccount[])
        : [],
      meta: opts.meta || {},
    });
  }

  txDeepLink = (_custodianDetails, _txId) => {
    return null;
  };

  constructor(opts: ICustodyKeyringOptions = {}) {
    super(opts);
  }

  getStatusMap(): ITransactionStatusMap {
    return null;
  }
}
