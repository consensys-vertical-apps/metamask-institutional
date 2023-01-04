// TO FIX import { CustodyKeyring } from "src/classes/CustodyKeyring";
// TO FIX import { MmiConfigurationController } from "src/controllers/mmi-configuration";

export class ITransactionUpdateControllerOptions {
  initState?: Record<string, unknown>;
  // TO FIX getCustodyKeyring?: (address: string) => Promise<CustodyKeyring>;
  custodianEventHandlerFactory?: () => Promise<any>;
  // TO FIX mmiConfigurationController: MmiConfigurationController;
  captureException: (error: Error) => void;
}
