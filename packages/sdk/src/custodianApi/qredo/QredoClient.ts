import { SimpleCache } from "@metamask-institutional/simplecache";
import { IEIP1559TxParams, ILegacyTXParams, IRefreshTokenChangeEvent } from "@metamask-institutional/types";
import { EventEmitter } from "events";

import { REFRESH_TOKEN_CHANGE_EVENT } from "../../constants/constants";
import { CustodianApiError } from "../../errors/CustodianApiError";
import { MessageTypes, TypedMessage } from "../../interfaces/ITypedMessage";
import { IQredoAccessTokenResponse } from "./interfaces/IQredoAccessTokenResponse";
import { IQredoCustomerProof } from "./interfaces/IQredoCustomerProof";
import { IQredoEthereumAccount } from "./interfaces/IQredoEthereumAccount";
import { IQredoNetworksResponse } from "./interfaces/IQredoNetworksResponse";
import { IQredoSignatureRequest } from "./interfaces/IQredoSignatureRequest";
import { IQredoSignatureResponse } from "./interfaces/IQredoSignatureResponse";
import { IQredoTransaction } from "./interfaces/IQredoTransaction";
import { IQredoTxDetails } from "./interfaces/IQredoTxDetails";
import { IQredoWalletsResponse } from "./interfaces/IQredoWalletsResponse";

const QREDO_CACHE_AGE = 800; // Qredo access token life is 900 seconds, so cache less than this

export class QredoClient extends EventEmitter {
  private cache = new SimpleCache();

  constructor(private apiUrl: string, private refreshToken: string) {
    super();
  }

  async getHeaders(): Promise<any["headers"]> {
    const accessToken = await this.cache.tryCachingArray("accessToken", QREDO_CACHE_AGE, async () => {
      return this.getAccessToken();
    });

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
  }

  async getAccessToken(): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/connect/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=refresh_token&refresh_token=${this.refreshToken}`,
      });

      if (!response.ok) {
        throw new Error(`Error fetching the access token. Status: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as IQredoAccessTokenResponse;

      if (!data.access_token) {
        throw new Error("No access token");
      }

      if (data.refresh_token && data.refresh_token !== this.refreshToken) {
        console.log(
          "JsonRPCClient: Refresh token changed to " +
            data.refresh_token.substring(0, 5) +
            "..." +
            data.refresh_token.substring(data.refresh_token.length - 5),
        );

        const oldRefreshToken = this.refreshToken;
        this.setRefreshToken(data.refresh_token);

        // This is a "bottom up" refresh token change, from the custodian
        const payload: IRefreshTokenChangeEvent = {
          oldRefreshToken,
          newRefreshToken: data.refresh_token,
        };
        this.emit(REFRESH_TOKEN_CHANGE_EVENT, payload);
      }

      return data.access_token;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async getEthereumAccounts(): Promise<IQredoEthereumAccount[]> {
    const headers = await this.getHeaders();

    try {
      const response = await fetch(`${this.apiUrl}/connect/wallets`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error fetching wallet accounts. Status: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as IQredoWalletsResponse;

      return data.wallets;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async createTransaction(
    qredoTxDetails: IQredoTxDetails,
    txParams: IEIP1559TxParams | ILegacyTXParams,
  ): Promise<IQredoTransaction> {
    const headers = await this.getHeaders();

    const payload: any = {
      to: txParams.to,
      from: qredoTxDetails.from,
      value: txParams.value,
      data: txParams.data,
      gasLimit: txParams.gasLimit,
      chainID: qredoTxDetails.chainId,
      note: qredoTxDetails.note,
    };

    if (txParams.type === "0" || txParams.type === "1") {
      payload.gasPrice = (txParams as ILegacyTXParams).gasPrice;
    } else if (txParams.type === "2") {
      payload.maxPriorityFeePerGas = (txParams as IEIP1559TxParams).maxPriorityFeePerGas;
      payload.maxFeePerGas = (txParams as IEIP1559TxParams).maxFeePerGas;
    }

    try {
      const response = await fetch(`${this.apiUrl}/connect/transaction`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error creating transaction. Status: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as IQredoTransaction;

      return data;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async getTransaction(custodian_transactionId: string): Promise<IQredoTransaction> {
    const headers = await this.getHeaders();

    try {
      const response = await fetch(`${this.apiUrl}/connect/transaction/${custodian_transactionId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Error getting transaction with id ${custodian_transactionId}. Status: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as IQredoTransaction;

      return data;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async getTransactions(): Promise<IQredoTransaction[]> {
    const headers = await this.getHeaders();

    throw new Error("Not implemented yet");
  }

  async getSignedMessage(custodian_signedMessageId: string): Promise<IQredoSignatureResponse> {
    const headers = await this.getHeaders();

    try {
      const response = await fetch(`${this.apiUrl}/connect/sign/${custodian_signedMessageId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Error getting signed message with id ${custodian_signedMessageId}. Status: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as IQredoSignatureResponse;

      return data;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async getCustomerProof(): Promise<IQredoCustomerProof> {
    const headers = await this.getHeaders();

    try {
      const response = await fetch(`${this.apiUrl}/connect/customer-proof`, {
        method: "POST",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error getting Custommer Proof. Status: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as IQredoCustomerProof;

      return data;
    } catch (e) {
      if (e.response?.status >= 400 && e.response?.status < 500) {
        // If there's an auth error - don't reuse the token!
        console.warn("Authentication error obtaining customer proof - deleting token");
        this.cache.deleteCache("accessToken");
      }
      throw new CustodianApiError(e);
    }
  }

  async getNetworks(): Promise<IQredoNetworksResponse> {
    const headers = await this.getHeaders();

    try {
      const response = await fetch(`${this.apiUrl}/connect/networks`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error getting Networks. Status: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as IQredoNetworksResponse;

      return data;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async signTypedData_v4(fromAddress: string, message: TypedMessage<MessageTypes>): Promise<IQredoSignatureResponse> {
    const headers = await this.getHeaders();

    const payload: IQredoSignatureRequest = {
      from: fromAddress,
      payload: message,
    };

    try {
      const response = await fetch(`${this.apiUrl}/connect/sign`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Error doing signTypedData from address: ${fromAddress}. Status: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async signPersonalMessage(fromAddress: string, message: string): Promise<IQredoSignatureResponse> {
    const headers = await this.getHeaders();

    const payload: IQredoSignatureRequest = {
      from: fromAddress,
      message,
    };

    try {
      const response = await fetch(`${this.apiUrl}/connect/sign`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Error doing signPersonalMessage from address: ${fromAddress}. Status: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  // This could be from a "top down" refresh token change
  // which doesn't emit an event

  setRefreshToken(refreshToken: string): void {
    this.refreshToken = refreshToken;
  }
}
