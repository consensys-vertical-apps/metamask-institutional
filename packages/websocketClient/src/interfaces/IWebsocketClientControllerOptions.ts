import { CustodyKeyring, MmiConfigurationController } from "@metamask-institutional/custody-keyring";
import { ICustodianUpdate } from "@metamask-institutional/types";

export class IWebsocketClientControllerOptions {
  initState?: Record<string, unknown>;
  getCustodyKeyring?: (address) => Promise<CustodyKeyring>;
  handleUpdateEvent?: (ev: ICustodianUpdate) => void;
  onFailure?: () => void;
  mmiConfigurationController: MmiConfigurationController;
  captureException: (error: Error) => void;
  onReconnect?: () => void;
  onWebsocketClose?: () => void;
}
