import { IEIP1559TxParams, ILegacyTXParams } from "@metamask-institutional/types";

import { CustodianApiError } from "../../errors/CustodianApiError";
import { MessageTypes, TypedMessage } from "../../interfaces/ITypedMessage";
import { IJupiterCustomerProof } from "./interfaces/IJupiterCustomerProof";
import { IJupiterEIP712SignatureRequest } from "./interfaces/IJupiterEIP712SignatureRequest";
import { IJupiterEIP712SignatureResponse } from "./interfaces/IJupiterEIP712SignatureResponse";
import { IJupiterEthereumAccount } from "./interfaces/IJupiterEthereumAccount";
import { IJupiterPersonalSignatureRequest } from "./interfaces/IJupiterPersonalSignatureRequest";
import { IJupiterPersonalSignatureResponse } from "./interfaces/IJupiterPersonalSignatureResponse";
import { IJupiterSupportedChains } from "./interfaces/IJupiterSupportedChains";
import { IJupiterTransaction } from "./interfaces/IJupiterTransaction";
import { IJupiterTxDetails } from "./interfaces/IJupiterTxDetails";

export class JupiterClient {
  private jupiterApiurl: string;
  private jwt: string;

  constructor(apiUrl: string, jwt: string) {
    this.jupiterApiurl = apiUrl;
    this.jwt = jwt;
  }

  getHeaders(): any["headers"] {
    return {
      Authorization: `Bearer ${this.jwt}`,
    };
  }

  async getEthereumAccounts(): Promise<IJupiterEthereumAccount[]> {
    const headers = this.getHeaders();

    try {
      const response = await fetch(`${this.jupiterApiurl}/custodian/account`, {
        headers,
      });

      const accounts: IJupiterEthereumAccount[] = await response.json();
      return accounts;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async createTransaction(
    jupiterTxDetails: IJupiterTxDetails,
    txParams: IEIP1559TxParams | ILegacyTXParams,
  ): Promise<IJupiterTransaction> {
    const headers = this.getHeaders();

    const payload: any = {
      to: txParams.to,
      accountId: jupiterTxDetails.accountId,
      value: txParams.value,
      data: txParams.data,
      type: txParams.type,
      gasLimit: txParams.gasLimit,
      network: jupiterTxDetails.chainId,
    };

    if (txParams.type === "0" || txParams.type === "1") {
      payload.gasPrice = (txParams as ILegacyTXParams).gasPrice;
    } else if (txParams.type === "2") {
      payload.maxPriorityFeePerGas = (txParams as IEIP1559TxParams).maxPriorityFeePerGas;
      payload.maxFeePerGas = (txParams as IEIP1559TxParams).maxFeePerGas;
    }

    try {
      const response = await fetch(`${this.jupiterApiurl}/custodian/transaction`, {
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

  async getTransaction(custodian_transactionId: string): Promise<IJupiterTransaction> {
    const headers = this.getHeaders();

    try {
      const response = await fetch(`${this.jupiterApiurl}/custodian/transaction/${custodian_transactionId}`, {
        headers,
      });

      const data = await response.json();
      return data;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async getTransactions(): Promise<IJupiterTransaction[]> {
    const headers = this.getHeaders();

    try {
      const response = await fetch(`${this.jupiterApiurl}/custodian/transaction`, {
        headers,
      });

      const data = await response.json();
      return data;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async getCustomerProof(customerId: string, issuer: string): Promise<IJupiterCustomerProof> {
    const headers = this.getHeaders();

    try {
      const response = await fetch(`${this.jupiterApiurl}/customer-proof`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          customerId,
          issuer,
          custodian: "jupiter",
        }),
      });

      const customerProof = await response.json();
      return customerProof;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async signTypedData_v4(
    accountId: string,
    message: TypedMessage<MessageTypes>,
    signatureVersion: string,
  ): Promise<IJupiterEIP712SignatureResponse> {
    const headers = this.getHeaders();

    const payload: IJupiterEIP712SignatureRequest = {
      accountId,
      payload: message,
      signatureVersion,
    };

    try {
      const response = await fetch(`${this.jupiterApiurl}/custodian/signature`, {
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

  async signPersonalMessage(accountId: string, message: string): Promise<IJupiterPersonalSignatureResponse> {
    const headers = this.getHeaders();

    const payload: IJupiterPersonalSignatureRequest = {
      accountId,
      payload: message,
    };

    try {
      const response = await fetch(`${this.jupiterApiurl}/custodian/personal-signature`, {
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

  async getSupportedChains(): Promise<IJupiterSupportedChains> {
    const headers = this.getHeaders();

    try {
      const response = await fetch(`${this.jupiterApiurl}/custodian/networks`, {
        headers,
      });

      const data = await response.json();
      return data;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }
}
