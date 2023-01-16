export interface IJupiterTransaction {
  from: string;
  to: string;
  data: string;
  gasLimit: string;
  gasPrice: string;
  value: string;
  transactionHash: string;
  transactionStatus:
    | "created"
    | "signed"
    | "submitted"
    | "mined"
    | "aborted"
    | "failed";
  nonce: string;
  createdTimestamp: string;
  signedTimestamp: string;
  abortedTimestamp: string;
  failedTimestamp: string;
  submittedTimestamp: string;
  minedTimestamp: string;
  failureReason: string;
  gasUsed: string;
  fees: string;
  network: string;
  signedRawTransaction: string;
  userId: string;
  id: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
}
