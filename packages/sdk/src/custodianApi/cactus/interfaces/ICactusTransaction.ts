export interface ICactusTransaction {
  nonce: string;
  from: string;
  signature: null;
  transactionStatus: "created" | "approved" | "submitted" | "rejected" | "failed" | "completed";
  transactionHash: string;
  custodian_transactionId: string;
  gasPrice: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  gasLimit: string;
}
