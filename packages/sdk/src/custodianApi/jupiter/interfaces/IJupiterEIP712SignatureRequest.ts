import { MessageTypes, TypedMessage } from "../../../interfaces/ITypedMessage";

export interface IJupiterEIP712SignatureRequest {
  payload: TypedMessage<MessageTypes>;
  accountId: string;
  signatureVersion: string;
}
