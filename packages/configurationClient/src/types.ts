import { IJsonRpcCustodian } from "@metamask-institutional/custody-keyring";

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
