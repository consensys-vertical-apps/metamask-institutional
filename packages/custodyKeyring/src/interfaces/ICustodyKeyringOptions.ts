import { ICustodianAccount } from "@metamask-institutional/types";
import { MmiConfigurationController } from "../mmiConfiguration";

export interface ICustodyKeyringOptions {
  accounts?: string[];
  selectedAddresses?: ICustodianAccount[];
  accountsDetails?: ICustodianAccount[];
  mmiConfigurationController?: MmiConfigurationController;
}
