import { IApiCallLogEntry } from "@metamask-institutional/custody-keyring";

import { API_REQUEST_LOG_EVENT } from "../../../constants/constants";
import { JsonRpcError } from "../interfaces/JsonRpcError";
import { JsonRpcResult } from "../interfaces/JsonRpcResult";

export default function (jsonRpcEndpoint: string, emit: (eventName: string, eventData: IApiCallLogEntry) => void) {
  let requestId = 0;

  return async function jsonRpcCall<T1, T2>(method: string, params: T1, accessToken: string): Promise<T2> {
    let response: Response;
    let responseJson;

    requestId++;

    console.debug("JSON-RPC >", method, requestId, params, jsonRpcEndpoint);

    try {
      response = await fetch(jsonRpcEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: requestId,
          method,
          params,
        }),
        credentials: "same-origin", // this is the default value for "withCredentials" in the Fetch API
      });

      responseJson = await response.json();

      emit(API_REQUEST_LOG_EVENT, {
        method,
        endpoint: jsonRpcEndpoint,
        success: !responseJson.error,
        timestamp: new Date().toISOString(),
        errorMessage: responseJson.error ? responseJson.error.message : undefined,
        responseData: responseJson.result,
      });

      if ((responseJson as JsonRpcError).error) {
        console.log("JSON-RPC <", method, requestId, responseJson, jsonRpcEndpoint);
        throw new Error((responseJson as JsonRpcError).error.message);
      }

      console.debug("JSON-RPC <", method, requestId, (responseJson as JsonRpcResult<any>).result, jsonRpcEndpoint);
    } catch (e) {
      // FIXME: Handle the various error types
      // TODO: How do we handle an expired token?

      console.log("JSON-RPC <", method, requestId, e, jsonRpcEndpoint);

      emit(API_REQUEST_LOG_EVENT, {
        method,
        endpoint: jsonRpcEndpoint,
        success: false,
        timestamp: new Date().toISOString(),
        errorMessage: e.message,
        responseData: null,
      });

      throw e;
    }

    return responseJson;
  };
}
