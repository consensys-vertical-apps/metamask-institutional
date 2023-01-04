export interface ITransactionStatus {
  mmStatus: string;
  shortText: string;
  longText: string;
  finished: boolean; // Whether we should not expect more updates for this transaction
}
