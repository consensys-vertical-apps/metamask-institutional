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
