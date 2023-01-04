export interface IWatchedTransaction {
  custodianTransactionId: string;
  attempts: number;
  complete: boolean;
  failed: boolean;
  from?: string;
  bufferType?: string;
  isSignedMessage?: boolean;
}
