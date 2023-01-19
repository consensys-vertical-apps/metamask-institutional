export interface JsonRpcResult<T> {
  id: number;
  jsonrpc: string;
  result: T;
}
