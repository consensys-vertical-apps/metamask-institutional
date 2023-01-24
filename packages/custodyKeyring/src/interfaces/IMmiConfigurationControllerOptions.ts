import { IJsonRpcCustodian } from "./IJsonRpcCustodian";

export class IMmiConfigurationControllerOptions {
  mmiConfigurationServiceUrl?: string;
  initState?: {
    mmiConfiguration: {
      portfolio: {
        enabled: boolean;
        url: string;
      };
      features: {
        websocketApi: boolean;
      };
      custodians: IJsonRpcCustodian[];
    };
  };
}
