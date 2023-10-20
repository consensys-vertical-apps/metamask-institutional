export interface JsonRpcReplaceTransactionParams {
  transactionId?: string;
  action?: string;
  gas?: string;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
  gasLimit?: string;
}

export interface JsonRpcReplaceTransactionGasParams {
  toBeAdded: string; // placeholder property
}

export type JsonRpcReplaceTransactionPayload = [JsonRpcReplaceTransactionParams, JsonRpcReplaceTransactionGasParams];
