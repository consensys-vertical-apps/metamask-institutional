import { ICustodianAccount } from "@metamask-institutional/types";

import { MmiConfigurationController } from "../MmiConfiguration";

export interface ICustodyKeyringOptions {
  accounts?: string[];
  selectedAddresses?: ICustodianAccount[];
  accountsDetails?: ICustodianAccount[];
  mmiConfigurationController?: MmiConfigurationController;
}
