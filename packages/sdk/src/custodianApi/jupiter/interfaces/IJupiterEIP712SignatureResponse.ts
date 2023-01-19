import { MessageTypes, TypedMessage } from "../../../interfaces/ITypedMessage";

export interface IJupiterEIP712SignatureResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  from: string;
  createdTimestamp: string;
  signedTimestamp: string;
  abortedTimestamp: string;
  payload: TypedMessage<MessageTypes>;
  signature: string;
  ethereumAccount: any;
  transactionStatus: "created" | "signed" | "aborted";
  userId: string;
  signatureVersion: string;
}
