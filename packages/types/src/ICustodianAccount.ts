import { AuthDetails } from "./types/AuthDetails";

interface Label {
  key: string;
  value: string;
}

// This is a horrible mess

interface ICustodianAccountProto {
  name?: string;
  address: string;
  custodianDetails: any;
  labels: Label[];
  /** @deprecated */
  apiUrl: string;
  chainId?: number;
  custodyType: string;
  meta?: { version: number };
  envName?: string;
}

// The type actually used in CustodyKeyring

export interface ICustodianAccount<T extends AuthDetails = AuthDetails> extends ICustodianAccountProto {
  authDetails: T;
}

// The type that's used in the extension, which is agnostic to authType

export interface IExtensionCustodianAccount extends ICustodianAccountProto {
  token: string; // TODO
}
