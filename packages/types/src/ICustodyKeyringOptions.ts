// TO FIX import { MmiConfigurationController } from "../controllers/mmi-configuration";
import { ICustodianAccount } from "./ICustodianAccount";

export interface ICustodyKeyringOptions {
  accounts?: string[];
  selectedAddresses?: ICustodianAccount[];
  accountsDetails?: ICustodianAccount[];
  // TO FIX mmiConfigurationController?: MmiConfigurationController;
}
