import { SimpleCache } from "@metamask-institutional/simplecache";
import { IRefreshTokenChangeEvent } from "@metamask-institutional/types";
import crypto from "crypto";
import { EventEmitter } from "events";

import { INTERACTIVE_REPLACEMENT_TOKEN_CHANGE_EVENT, REFRESH_TOKEN_CHANGE_EVENT } from "../../constants/constants";
import { JsonRpcResult } from "./interfaces/JsonRpcResult";
import { JsonRpcCreateTransactionPayload } from "./rpc-payloads/JsonRpcCreateTransactionPayload";
import { JsonRpcGetSignedMessageByIdPayload } from "./rpc-payloads/JsonRpcGetSignedMessageByIdPayload";
import { JsonRpcGetSignedMessageLinkPayload } from "./rpc-payloads/JsonRpcGetSignedMessageLinkPayload";
import { JsonRpcGetTransactionByIdPayload } from "./rpc-payloads/JsonRpcGetTransactionByIdPayload";
import { JsonRpcGetTransactionLinkPayload } from "./rpc-payloads/JsonRpcGetTransactionLinkPayload";
import { JsonRpcListAccountChainIdsPayload } from "./rpc-payloads/JsonRpcListAccountChainIdsPayload";
import { JsonRpcReplaceTransactionPayload } from "./rpc-payloads/JsonRpcReplaceTransactionPayload";
import { JsonRpcSignedMessagePayload } from "./rpc-payloads/JsonRpcSignPayload";
import { JsonRpcSignTypedDataPayload } from "./rpc-payloads/JsonRpcSignTypedDataPayload";
import { JsonRpcCreateTransactionResult } from "./rpc-responses/JsonRpcCreateTransactionResult";
import { JsonRpcGetCustomerProofResponse } from "./rpc-responses/JsonRpcGetCustomerProofResponse";
import { JsonRpcGetSignedMessageByIdResponse } from "./rpc-responses/JsonRpcGetSignedMessageByIdResponse";
import { JsonRpcGetSignedMessageLinkResponse } from "./rpc-responses/JsonRpcGetSignedMessageLinkResponse";
import { JsonRpcGetTransactionByIdResponse } from "./rpc-responses/JsonRpcGetTransactionByIdResponse";
import { JsonRpcGetTransactionLinkResponse } from "./rpc-responses/JsonRpcGetTransactionLinkResponse";
import { JsonRpcListAccountsResponse } from "./rpc-responses/JsonRpcListAccountsResponse";
import { JsonRpcListAccountsSignedResponse } from "./rpc-responses/JsonRpcListAccountsSignedResponse";
import { JsonRpcReplaceTransactionResponse } from "./rpc-responses/JsonRpcReplaceTransactionResponse";
import { JsonRpcSignResponse } from "./rpc-responses/JsonRpcSignResponse";
import { JsonRpcSignTypedDataResponse } from "./rpc-responses/JsonRpcSignTypedDataResponse";
import factory from "./util/json-rpc-call";

export class ECA3Client extends EventEmitter {
  private call: <T1, T2>(method: string, params: T1, accessToken: string) => Promise<JsonRpcResult<T2>>;

  private cache: SimpleCache;

  // At the start, we don't know how long the token will be valid for
  private cacheAge = null;

  constructor(private apiBaseUrl: string, private refreshToken: string, private refreshTokenUrl: string) {
    super();

    this.call = factory(`${apiBaseUrl}/v3/json-rpc`);

    this.cache = new SimpleCache();
  }

  // This could be from a "top down" refresh token change
  // which doesn't emit an event

  setRefreshToken(refreshToken: string) {
    const payload: IRefreshTokenChangeEvent = {
      oldRefreshToken: this.refreshToken,
      newRefreshToken: refreshToken,
    };
    this.emit(REFRESH_TOKEN_CHANGE_EVENT, payload);
    this.refreshToken = refreshToken;
  }

  async getAccessToken(): Promise<string> {
    if (this.cacheAge) {
      const cacheExists = this.cache.cacheExists("accessToken");

      if (cacheExists && this.cache.cacheValid("accessToken", this.cacheAge)) {
        return this.cache.getCache<string>("accessToken");
      }
    }

    try {
      const data = {
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
      };

      const options = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const response = await fetch(this.refreshTokenUrl, {
        method: "POST",
        body: JSON.stringify(data),
        headers: options.headers,
        credentials: "same-origin", // this is the default value for "withCredentials" in the Fetch API
      });

      /**
       * If the server responds with a 401 status code when trying to get the access token,
       * it means the refresh token provided is no longer valid.
       * This could be due to the token being expired, revoked, or the token not being recognized by the server.
       */
      if (response?.status === 401 && response?.url) {
        const url = response.url;
        const oldRefreshToken = this.refreshToken;
        const hashedToken = crypto
          .createHash("sha256")
          .update(oldRefreshToken + url)
          .digest("hex");

        this.emit(INTERACTIVE_REPLACEMENT_TOKEN_CHANGE_EVENT, {
          url,
          oldRefreshToken: hashedToken,
        });

        throw new Error("Refresh token provided is no longer valid.");
      }

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(`Request failed with status ${response.status}: ${errorResponse.message}`);
      }

      const responseJson = await response.json();

      this.cacheAge = responseJson.expires_in;
      this.cache.setCache<string>("accessToken", responseJson.access_token);

      if (responseJson.refresh_token && responseJson.refresh_token !== this.refreshToken) {
        console.log(
          "JsonRPCClient: Refresh token changed to " +
            responseJson.refresh_token.substring(0, 5) +
            "..." +
            responseJson.refresh_token.substring(responseJson.refresh_token.length - 5),
        );

        const oldRefreshToken = this.refreshToken;
        this.setRefreshToken(responseJson.refresh_token);

        // This is a "bottom up" refresh token change, from the custodian
        const payload: IRefreshTokenChangeEvent = {
          oldRefreshToken,
          newRefreshToken: responseJson.refresh_token,
        };
        this.emit(REFRESH_TOKEN_CHANGE_EVENT, payload);
      }

      return responseJson.access_token;
    } catch (error) {
      throw new Error(`Error getting the Access Token: ${error}`);
    }
  }

  async listAccounts(): Promise<JsonRpcResult<JsonRpcListAccountsResponse>> {
    const accessToken = await this.getAccessToken();

    return this.call("custodian_listAccounts", {}, accessToken);
  }

  async listAccountsSigned(): Promise<JsonRpcResult<JsonRpcListAccountsSignedResponse>> {
    const accessToken = await this.getAccessToken();

    return this.call("custodian_listAccountsSigned", {}, accessToken);
  }

  async replaceTransaction(
    replaceTransactionPayload: JsonRpcReplaceTransactionPayload,
  ): Promise<JsonRpcResult<JsonRpcReplaceTransactionResponse>> {
    const accessToken = await this.getAccessToken();

    return this.call("custodian_replaceTransaction", replaceTransactionPayload, accessToken);
  }

  async getCustomerProof(): Promise<JsonRpcResult<JsonRpcGetCustomerProofResponse>> {
    const accessToken = await this.getAccessToken();

    return this.call("custodian_getCustomerProof", {}, accessToken);
  }

  async createTransaction(
    createTransactionPayload: JsonRpcCreateTransactionPayload,
  ): Promise<JsonRpcResult<JsonRpcCreateTransactionResult>> {
    const accessToken = await this.getAccessToken();

    return this.call("custodian_createTransaction", createTransactionPayload, accessToken);
  }

  async getAccountChainIds(
    listAccountChainIdPayload: JsonRpcListAccountChainIdsPayload,
  ): Promise<JsonRpcResult<string[]>> {
    const accessToken = await this.getAccessToken();

    return this.call("custodian_listAccountChainIds", listAccountChainIdPayload, accessToken);
  }

  async signPersonalMessage(signPayload: JsonRpcSignedMessagePayload): Promise<JsonRpcResult<JsonRpcSignResponse>> {
    const accessToken = await this.getAccessToken();

    return this.call("custodian_sign", signPayload, accessToken);
  }

  async signTypedData(signPayload: JsonRpcSignTypedDataPayload): Promise<JsonRpcResult<JsonRpcSignTypedDataResponse>> {
    const accessToken = await this.getAccessToken();

    return this.call("custodian_signTypedData", signPayload, accessToken);
  }

  async getTransaction(
    getTransactionPayload: JsonRpcGetTransactionByIdPayload,
  ): Promise<JsonRpcResult<JsonRpcGetTransactionByIdResponse>> {
    const accessToken = await this.getAccessToken();

    return this.call("custodian_getTransactionById", getTransactionPayload, accessToken);
  }

  async getSignedMessage(
    getSignedMessagePayload: JsonRpcGetSignedMessageByIdPayload,
  ): Promise<JsonRpcResult<JsonRpcGetSignedMessageByIdResponse>> {
    const accessToken = await this.getAccessToken();

    return this.call("custodian_getSignedMessageById", getSignedMessagePayload, accessToken);
  }

  async getTransactionLink(
    getTransactionLinkPayload: JsonRpcGetTransactionLinkPayload,
  ): Promise<JsonRpcResult<JsonRpcGetTransactionLinkResponse>> {
    const accessToken = await this.getAccessToken();

    return this.call("custodian_getTransactionLink", getTransactionLinkPayload, accessToken);
  }

  async getSignedMessageLink(
    getSignedMessageLinkPayload: JsonRpcGetSignedMessageLinkPayload,
  ): Promise<JsonRpcResult<JsonRpcGetSignedMessageLinkResponse>> {
    const accessToken = await this.getAccessToken();

    return this.call("custodian_getSignedMessageLink", getSignedMessageLinkPayload, accessToken);
  }
}
