export interface ICustodianEnvironment {
  type: string;
  name: string;
  onboardingUrl: string;
  website: string;
  envName: string;
  apiUrl: string;
  apiVersion: string;
  iconUrl: string;
  displayName: string;
  production: boolean;
  refreshTokenUrl: string;
  websocketApiUrl: string;
  isNoteToTraderSupported: boolean;
  isQRCodeSupported: boolean;
  isManualTokenInputSupported: boolean;
  custodianPublishesTransaction: boolean;
  version: number;
}
