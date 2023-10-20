export interface JsonRpcGetSignedMessageByIdResponse {
  address: string;
  signature: string;
  status: {
    finished: boolean;
    signed: boolean;
    success: boolean;
    displayText: string;
    reason: string;
  };
}
