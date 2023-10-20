import { JsonRpcResult } from "../interfaces/JsonRpcResult";
import { JsonRpcSignResponse } from "../rpc-responses/JsonRpcSignResponse";

export const mockJsonRpcSignResponse: JsonRpcResult<JsonRpcSignResponse> = {
  id: 1,
  jsonrpc: "2.0",
  result: "ef8cb7af-1a00-4687-9f82-1f1c82fbef54",
};
