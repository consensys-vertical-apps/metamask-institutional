interface Label {
  key: string;
  value: string;
}

export interface IEthereumAccount<T> {
  name?: string;
  address: string;
  custodianDetails: T;
  labels?: Label[];
  balance?: string;
}
