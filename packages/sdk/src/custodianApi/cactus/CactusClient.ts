import { SimpleCache } from "@metamask-institutional/simplecache";
import { IEIP1559TxParams, ILegacyTXParams } from "@metamask-institutional/types";

import { MessageTypes, TypedMessage } from "../../interfaces/ITypedMessage";
import { handleResponse } from "../../util/handle-response";
import { ICactusAccessTokenResponse } from "./interfaces/ICactusAccessTokenResponse";
import { ICactusChainIdsResponse } from "./interfaces/ICactusChainIdsResponse";
import { ICactusCustomerProof } from "./interfaces/ICactusCustomerProof";
import { ICactusEthereumAccount } from "./interfaces/ICactusEthereumAccount";
import { ICactusSignatureRequest } from "./interfaces/ICactusSignatureRequest";
import { ICactusSignatureResponse } from "./interfaces/ICactusSignatureResponse";
import { ICactusTransaction } from "./interfaces/ICactusTransaction";
import { ICactusTxDetails } from "./interfaces/ICactusTxDetails";

const CACTUS_CACHE_AGE = 120 * 60;

export class CactusClient {
  private cache = new SimpleCache();

  constructor(private apiUrl: string, private refreshToken: string) {}

  async getHeaders(): Promise<any["headers"]> {
    const accessToken = await this.cache.tryCachingArray("accessToken", CACTUS_CACHE_AGE, async () => {
      return this.getAccessToken();
    });

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
  }

  async getAccessToken(): Promise<string> {
    const response = await fetch(`${this.apiUrl}/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grantType: "refresh_token",
        refreshToken: this.refreshToken,
      }),
    });

    const contextErrorMessage = "Error fetching the access token";
    const data: ICactusAccessTokenResponse = await handleResponse(response, contextErrorMessage);

    if (!data.jwt) {
      throw new Error("No access token");
    }

    return data.jwt;
  }

  async getEthereumAccounts(): Promise<ICactusEthereumAccount[]> {
    const headers = await this.getHeaders();

    const response = await fetch(`${this.apiUrl}/eth-accounts`, {
      headers,
    });

    const contextErrorMessage = "Error fetching accounts";
    const accounts: ICactusEthereumAccount[] = await handleResponse(response, contextErrorMessage);

    return accounts;
  }

  async createTransaction(
    cactusTxDetails: ICactusTxDetails,
    txParams: IEIP1559TxParams | ILegacyTXParams,
  ): Promise<ICactusTransaction> {
    const headers = await this.getHeaders();

    const payload: any = {
      to: txParams.to,
      from: txParams.from,
      value: txParams.value,
      data: txParams.data,
      gasLimit: txParams.gasLimit,
      note: cactusTxDetails.note,
    };

    if (txParams.type === "0" || txParams.type === "1") {
      payload.gasPrice = (txParams as ILegacyTXParams).gasPrice;
    } else if (txParams.type === "2") {
      payload.maxPriorityFeePerGas = (txParams as IEIP1559TxParams).maxPriorityFeePerGas;
      payload.maxFeePerGas = (txParams as IEIP1559TxParams).maxFeePerGas;
    }

    const response = await fetch(`${this.apiUrl}/transactions?chainId=${cactusTxDetails.chainId}`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers,
    });

    const contextErrorMessage = "Error creating transaction";
    return await handleResponse(response, contextErrorMessage);
  }

  async getSignedMessage(custodian_signedMessageId: string): Promise<ICactusSignatureResponse> {
    const headers = await this.getHeaders();

    const response = await fetch(`${this.apiUrl}/signatures?transactionId=${custodian_signedMessageId}`, {
      headers,
    });

    const contextErrorMessage = `Error getting signed message with id ${custodian_signedMessageId}`;
    const data = await handleResponse(response, contextErrorMessage);

    if (data.length) {
      return data[0] as ICactusSignatureResponse;
    }

    return null;
  }

  async getTransaction(custodian_transactionId: string): Promise<ICactusTransaction> {
    const headers = await this.getHeaders();

    const response = await fetch(`${this.apiUrl}/transactions?transactionId=${custodian_transactionId}`, {
      headers,
    });

    const contextErrorMessage = `Error getting transaction with id ${custodian_transactionId}`;
    const data = await handleResponse(response, contextErrorMessage);

    if (data.length) {
      return data[0];
    }

    return null;
  }

  async getTransactions(chainId: number): Promise<ICactusTransaction[]> {
    const headers = await this.getHeaders();

    const response = await fetch(`${this.apiUrl}/transactions?chainId=${chainId}`, {
      headers,
    });

    const contextErrorMessage = `Error getting transactions with chainId ${chainId}`;
    return await handleResponse(response, contextErrorMessage);
  }

  async getCustomerProof(): Promise<ICactusCustomerProof> {
    const headers = await this.getHeaders();

    const response = await fetch(`${this.apiUrl}/customer-proof`, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });

    const contextErrorMessage = "Error getting Custommer Proof";
    return await handleResponse(response, contextErrorMessage);
  }

  async signTypedData_v4(
    fromAddress: string,
    message: TypedMessage<MessageTypes>,
    signatureVersion: string,
    chainId?: number,
  ): Promise<ICactusSignatureResponse> {
    const headers = await this.getHeaders();

    const payload: ICactusSignatureRequest = {
      address: fromAddress,
      payload: message,
      signatureVersion,
    };

    let url = `${this.apiUrl}/signatures`;

    if (chainId) {
      url += `?chainId=${chainId}`;
    }

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers,
    });

    const contextErrorMessage = `Error doing signTypedData from address: ${fromAddress}`;
    return await handleResponse(response, contextErrorMessage);
  }

  async signPersonalMessage(fromAddress: string, message: string): Promise<ICactusSignatureResponse> {
    const headers = await this.getHeaders();

    const payload: ICactusSignatureRequest = {
      address: fromAddress,
      payload: {
        message,
      },
      signatureVersion: "personalSign",
    };

    const response = await fetch(`${this.apiUrl}/signatures`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers,
    });

    const contextErrorMessage = `Error doing signPersonalMessage from address: ${fromAddress}`;
    return await handleResponse(response, contextErrorMessage);
  }

  async getChainIds(): Promise<ICactusChainIdsResponse> {
    const headers = await this.getHeaders();

    const response = await fetch(`${this.apiUrl}/chainIds`, {
      headers,
    });

    const contextErrorMessage = "Error getting chainIds";
    const data: ICactusChainIdsResponse = await handleResponse(response, contextErrorMessage);

    return data;
  }
}
