import { JsonRpcResult } from "../interfaces/JsonRpcResult";
import { JsonRpcSignTypedDataResponse } from "../rpc-responses/JsonRpcSignTypedDataResponse";

export const mockJsonRpcSignTypedDataResponse: JsonRpcResult<JsonRpcSignTypedDataResponse> = {
  id: 1,
  jsonrpc: "2.0",
  result: "ef8cb7af-1a00-4687-9f82-1f1c82fbef54",
};
