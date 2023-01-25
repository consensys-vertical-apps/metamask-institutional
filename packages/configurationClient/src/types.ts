export interface IJsonRpcCustodian {
  id: string;
  clientId: string;
  name: string;
  displayName: string;
  iconUrl: string;
  enabled: boolean;
  apiBaseUrl: string;
  issuerClaim: string;
  jwksUrl: string;
  refreshTokenUrl: string;
  websocketApiUrl: string;
  isNoteToTraderSupported: boolean;
}

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
