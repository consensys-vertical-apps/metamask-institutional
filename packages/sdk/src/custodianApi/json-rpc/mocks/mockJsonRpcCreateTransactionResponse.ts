import { JsonRpcResult } from "../interfaces/JsonRpcResult";
import { JsonRpcCreateTransactionResult } from "../rpc-responses/JsonRpcCreateTransactionResult";

export const mockJsonRpcCreateTransactionResponse: JsonRpcResult<JsonRpcCreateTransactionResult> = {
  id: 1,
  jsonrpc: "2.0",
  result: "ef8cb7af-1a00-4687-9f82-1f1c82fbef54",
};
