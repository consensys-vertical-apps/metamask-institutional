type QredoEthereumAccountLabel = {
  key: string;
  name: string;
  value: string;
};

export interface IQredoEthereumAccount {
  walletID: string;
  network: "eth-ropsten" | "eth-mainnet";
  address: string;
  labels: QredoEthereumAccountLabel[];
}
