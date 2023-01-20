import { TransactionStatus } from "@metamask-institutional/types";

export interface IBitgoTransaction {
  transactionStatus: TransactionStatus;
  custodianTransactionId: string;
  from: string;
  to: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  data: string;
  gasLimit: string;
  value: string;
  nextContractSequenceId?: number;
  userId: string;
  createdTime: string;

  transactionHash: string;
  nonce?: string;
}
