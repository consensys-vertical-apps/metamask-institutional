// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ICustodianDetails {
  apiUrl: string;
  jwt?: string; // Jupiter, Bitgo
  refreshToken?: string; // Qredo, Cactus
}
