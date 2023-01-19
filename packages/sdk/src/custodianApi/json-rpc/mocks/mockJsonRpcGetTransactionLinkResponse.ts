import { JsonRpcResult } from "../interfaces/JsonRpcResult";
import { JsonRpcGetTransactionLinkResponse } from "../rpc-responses/JsonRpcGetTransactionLinkResponse";

export const mockJsonRpcGetTransactionLinkResponse: JsonRpcResult<JsonRpcGetTransactionLinkResponse> = {
  id: 1,
  jsonrpc: "2.0",
  result: {
    transactionId: "ef8cb7af-1a00-4687-9f82-1f1c82fbef54",
    url: "https://example.com/transaction/ef8cb7af-1a00-4687-9f82-1f1c82fbef54",
    text: "Approve your transaction in the custodian interface",
    action: "Approve",
    ethereum: {
      accounts: ["0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826"],
      chainId: ["0x1"],
    },
  },
};
