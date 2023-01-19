import { MessageTypes, TypedMessage } from "../../../interfaces/ITypedMessage";

export interface ICactusSignatureRequest {
  address: string;
  signatureVersion: string;
  payload:
    | TypedMessage<MessageTypes>
    | {
        message: string;
      };
}
