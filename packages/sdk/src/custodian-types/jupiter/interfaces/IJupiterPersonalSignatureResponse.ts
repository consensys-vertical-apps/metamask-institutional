export interface IJupiterPersonalSignatureResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  from: string;
  createdTimestamp: string;
  signedTimestamp: string;
  abortedTimestamp: string;
  payload: string;
  signature: string;
  ethereumAccount: any;
  transactionStatus: "created" | "signed" | "aborted";
  userId: string;
}
