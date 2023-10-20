export interface JsonRpcGetSignedMessageLinkResponse {
  transactionId: string;
  url: string;
  text: string;
  action: string;
  ethereum?: {
    accounts: string[];
    chainId: string[];
  };
}
