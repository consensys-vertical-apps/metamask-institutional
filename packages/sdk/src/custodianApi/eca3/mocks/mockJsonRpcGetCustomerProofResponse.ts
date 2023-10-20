import { JsonRpcResult } from "../interfaces/JsonRpcResult";
import { JsonRpcGetCustomerProofResponse } from "../rpc-responses/JsonRpcGetCustomerProofResponse";

export const mockJsonRpcGetCustomerProofResponse: JsonRpcResult<JsonRpcGetCustomerProofResponse> = {
  id: 1,
  jsonrpc: "2.0",
  result: {
    jwt: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTYiLCJpc3MiOiJleGFtcGxlLmNvbSJ9.IlBfD4xmjpQiQCrkiIwIztEHrEH7e7RuswWPbIlJwUI",
  },
};
