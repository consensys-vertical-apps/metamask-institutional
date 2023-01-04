// TO FIX import { CustodyKeyring } from "src/classes/CustodyKeyring";
// TO FIX import { MmiConfigurationController } from "src/controllers/mmi-configuration";
import { IWebhookJsonRpc2Request } from './IWebhookJsonRpc2Request';

export class IWebsocketClientControllerOptions {
  initState?: Record<string, unknown>;
  customerProof?: string;
  // TO FIX getCustodyKeyring?: (address) => Promise<CustodyKeyring>;
  custodianEventHandlerFactory?: () => Record<string, unknown>;
  handleUpdateEvent?: (ev: IWebhookJsonRpc2Request) => void;
  startPolling?: () => void;
  // TO FIX mmiConfigurationController: MmiConfigurationController;
  captureException: (error: Error) => void;
}
