type EnvironmentMapping = {
  pattern: RegExp;
  mmiApiUrl: string;
};

export interface ICustodianType {
  name: string;
  displayName: string;
  apiUrl: string;
  imgSrc: string;
  icon: string;
  website: string;
  envName: string;
  keyringClass: any; // Would like to make this CustodyKeyring but not sure how
  production: boolean; // Show in store builds
  hidden: boolean; // Completely hide in all builds
  origins: RegExp[];
  environmentMapping: EnvironmentMapping[]; // This allows mapping certain API URLs to certain MMI API URLs - deprecated since websockets
}

export interface ICustodianTransactionLink {
  transactionId: string;
  url: string;
  text: string;
  action: string;
  ethereum?: {
    accounts: string[];
    chainId: string[];
  };
}
