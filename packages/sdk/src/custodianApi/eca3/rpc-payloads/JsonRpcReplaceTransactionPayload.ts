export interface JsonRpcReplaceTransactionParams {
  transactionId?: string;
  action?: string;
  gas?: string;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
  gasLimit?: string;
}

export interface JsonRpcReplaceTransactionGasParams {
  gas?: string;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
}

export type JsonRpcReplaceTransactionPayload = [JsonRpcReplaceTransactionParams, JsonRpcReplaceTransactionGasParams];
