import { MessageTypes, TypedMessage } from "../../../interfaces/ITypedMessage";
import { QredoTransactionEvent, QredoTransactionStatus } from "../types";

export type IQredoSignatureResponse = {
  sigID: string;
  status: QredoTransactionStatus;
  message: string | TypedMessage<MessageTypes>;
  timestamps: {
    [key: string]: number;
  };
  events: QredoTransactionEvent[];
  from: string;
  createdBy: string;
  signature: string;
};
