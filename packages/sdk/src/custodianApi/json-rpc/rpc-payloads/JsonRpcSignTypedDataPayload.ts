import { MessageTypes, TypedMessage } from "../../../interfaces/ITypedMessage";

export type JsonRpcSignTypedDataPayload = [string, TypedMessage<MessageTypes>, string];
