import { MessageTypes, TypedMessage } from "../../../interfaces/ITypedMessage";

export interface IQredoSignatureRequest {
  message?: string;
  payload?: TypedMessage<MessageTypes>;
  from: string;
}
