export interface ITransactionDetails {
  transactionStatus: TransactionStatus;
  transactionHash?: string; // Optional because signatures have no hash and not all transactions are submitted yet
  custodian_transactionId: string;
  from: string;
  gasPrice?: string;
  gasLimit?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: string; // Optional because non-submitted transactions have no nonce
  reason?: string; // Optional because only JSON-RPC transactions have a reason

  // Immutable params can be return from the custodian API but they are not needed to update transactions

  to?: string; // Optional because it's not really needed and some custodians do not set this
  value?: string; // Optional because it's not really needed and some custodians do not set this
  data?: string; // Optional because it's not really needed and some custodians do not set this

  transactionStatusDisplayText?: string; // Optional because it's used for displayText from custodian transaction

  transactionId?: string;
  
  chainId?: number;
  custodianPublishesTransaction?: boolean;
  signedRawTransaction?: string;
  rpcUrl?: string;
  note?: string;
}

export type TransactionStatus =
  | "authorized"
  | "created"
  | "approved"
  | "signed"
  | "scheduled"
  | "pending"
  | "submitted"
  | "pushed"
  | "mined"
  | "confirmed"
  | "completed"
  | "aborted"
  | "failed"
  | "rejected"
  | "cancelled"
  | "override"
  | "expired";
