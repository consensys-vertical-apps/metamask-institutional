import { ICustodianAccount } from "./ICustodianAccount";

export interface ISerializedKeyring {
  accounts: string[];
  selectedAddresses: ICustodianAccount[];
  accountsDetails: ICustodianAccount[];
  meta: { version?: number };
}
