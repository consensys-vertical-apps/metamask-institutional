import { ICustodianAccount } from "@metamask-institutional/types";
import { MmiConfigurationController } from "@metamask-institutional/mmi-configuration";

export interface ICustodyKeyringOptions {
  accounts?: string[];
  selectedAddresses?: ICustodianAccount[];
  accountsDetails?: ICustodianAccount[];
  mmiConfigurationController?: MmiConfigurationController;
}
