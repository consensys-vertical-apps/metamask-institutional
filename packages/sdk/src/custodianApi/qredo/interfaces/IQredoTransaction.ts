import { QredoTransactionEvent, QredoTransactionStatus } from "../types";

export interface IQredoTransaction {
  txID: string;
  txHash: string;
  status: QredoTransactionStatus;
  timestamps: {
    [key: string]: number;
  };
  events: QredoTransactionEvent[];
  nonce: number;
  gasPrice: string;
  gasLimit: string;
  rawTX: string;
  from: string;
}
