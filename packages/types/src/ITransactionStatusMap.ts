import { ITransactionStatus } from "./ITransactionStatus";

export interface ITransactionStatusMap {
  [custodyStatus: string]: ITransactionStatus;
}
