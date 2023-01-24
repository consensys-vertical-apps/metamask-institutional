import { IJsonRpcCustodian } from "./IJsonRpcCustodian";

export interface IConfiguration {
  portfolio: {
    enabled: boolean;
    url: string;
    cookieSetUrls: string[];
  };
  features: {
    websocketApi: boolean;
  };
  custodians: IJsonRpcCustodian[];
}
