import { JsonRpcResult } from "../interfaces/JsonRpcResult";
import { JsonRpcListAccountChainIdsResponse } from "../rpc-responses/JsonRpcListAccountChainIdsResponse";

export const mockJsonRpcListAccountChainIdsResponse: JsonRpcResult<JsonRpcListAccountChainIdsResponse> = {
  id: 1,
  jsonrpc: "2.0",
  result: ["0x1", "0x3"],
};
