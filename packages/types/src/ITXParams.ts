interface ITXParams {
  from: string; // TODO: Might be possible to store the wallet_address_id in metamask and not have to translate this
  to: string;
  value?: string; // Wei
  data?: string;
  gasLimit: string;
  gas?: string; // what gas limit is called in metamask
  nonce?: number | string;
}

export interface ILegacyTXParams extends ITXParams {
  gasPrice: string;
  type?: "0" | "1";
}

export interface IEIP1559TxParams extends ITXParams {
  maxPriorityFeePerGas: string;
  maxFeePerGas: string;
  type: "2";
}
