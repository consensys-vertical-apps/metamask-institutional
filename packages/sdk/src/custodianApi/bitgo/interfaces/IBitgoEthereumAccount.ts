export interface IBitgoEthereumAccount {
  address: string;
  balance: string;
  chainId: number;
  custodianDetails: {
    coin: string;
    id: string;
  };
  labels: { key: string; value: string }[];
}
