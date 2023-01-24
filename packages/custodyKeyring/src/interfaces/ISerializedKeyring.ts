import { ICustodianAccount } from "@metamask-institutional/types";

export interface ISerializedKeyring {
  accounts: string[];
  selectedAddresses: ICustodianAccount[];
  accountsDetails: ICustodianAccount[];
  meta: { version?: number };
}
