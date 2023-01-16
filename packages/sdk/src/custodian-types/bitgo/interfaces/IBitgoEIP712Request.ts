import { MessageTypes, TypedMessage } from "../../../interfaces/ITypedMessage";

export interface IBitgoEIP712Request {
  address: string;
  payload: TypedMessage<MessageTypes>;
}
