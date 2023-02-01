import { SimpleCache } from "@metamask-institutional/simplecache";
import { IEIP1559TxParams, ILegacyTXParams } from "@metamask-institutional/types";

import { CustodianApiError } from "../../errors/CustodianApiError";
import { MessageTypes, TypedMessage } from "../../interfaces/ITypedMessage";
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
      Authorization: `Bearer ${accessToken}`,
    };
  }

  async getAccessToken(): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/tokens`, {
        method: "POST",
        body: JSON.stringify({
          grantType: "refresh_token",
          refreshToken: this.refreshToken,
        }),
      });

      const data: ICactusAccessTokenResponse = await response.json();

      if (!data.jwt) {
        throw new Error("No access token");
      }

      return data.jwt;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async getEthereumAccounts(): Promise<ICactusEthereumAccount[]> {
    const headers = await this.getHeaders();

    try {
      const response = await fetch(`${this.apiUrl}/eth-accounts`, {
        headers,
      });
      const accounts: ICactusEthereumAccount[] = await response.json();
      return accounts;
    } catch (e) {
      throw new CustodianApiError(e);
    }
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

    try {
      const response = await fetch(`${this.apiUrl}/transactions?chainId=${cactusTxDetails.chainId}`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers,
      });
      const data = await response.json();
      return data;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async getSignedMessage(custodian_signedMessageId: string): Promise<ICactusSignatureResponse> {
    const headers = await this.getHeaders();

    try {
      const response = await fetch(`${this.apiUrl}/signatures?transactionId=${custodian_signedMessageId}`, {
        headers,
      });

      const data = await response.json();

      if (data.length) {
        return data[0] as ICactusSignatureResponse;
      }

      return null;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async getTransaction(custodian_transactionId: string): Promise<ICactusTransaction> {
    const headers = await this.getHeaders();

    try {
      const response = await fetch(`${this.apiUrl}/transactions?transactionId=${custodian_transactionId}`, {
        headers,
      });

      const data = await response.json();

      if (data.length) {
        return data[0];
      }
      return null;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async getTransactions(chainId: number): Promise<ICactusTransaction[]> {
    const headers = await this.getHeaders();

    try {
      const response = await fetch(`${this.apiUrl}/transactions?chainId=${chainId}`, {
        headers,
      });

      const data = await response.json();

      return data;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async getCustomerProof(): Promise<ICactusCustomerProof> {
    const headers = await this.getHeaders();

    try {
      const response = await fetch(`${this.apiUrl}/customer-proof`, {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      });

      const customerProof = await response.json();
      return customerProof;
    } catch (e) {
      throw new CustodianApiError(e);
    }
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

    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers,
      });
      const data = await response.json();
      return data;
    } catch (e) {
      throw new CustodianApiError(e);
    }
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

    try {
      const response = await fetch(`${this.apiUrl}/signatures`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers,
      });
      const data = await response.json();
      return data;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async getChainIds(): Promise<ICactusChainIdsResponse> {
    const headers = await this.getHeaders();

    try {
      const response = await fetch(`${this.apiUrl}/chainIds`, {
        headers,
      });

      const data: ICactusChainIdsResponse = await response.json();
      return data;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }
}
