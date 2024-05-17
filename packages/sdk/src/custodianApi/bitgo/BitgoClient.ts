import { IEIP1559TxParams, ILegacyTXParams } from "@metamask-institutional/types";

import { MessageTypes, TypedMessage } from "../../interfaces/ITypedMessage";
import { handleResponse } from "../../util/handle-response";
import { IBitgoCreateTransactionResponse } from "./interfaces/IBitgoCreateTransactionResponse";
import { IBitgoCustomerProof } from "./interfaces/IBitgoCustomerProof";
import { IBitgoEIP712Request } from "./interfaces/IBitgoEIP712Request";
import { IBitgoEIP712Response } from "./interfaces/IBitgoEIP712Response";
import { IBitgoEthereumAccount } from "./interfaces/IBitgoEthereumAccount";
import { IBitgoGetEthereumAccountsResponse } from "./interfaces/IBitgoGetEthereumAccountsResponse";
import { IBitgoPersonalSignRequest } from "./interfaces/IBitgoPersonalSignRequest";
import { IBitgoPersonalSignResponse } from "./interfaces/IBitgoPersonalSignResponse";
import { IBitgoTransaction } from "./interfaces/IBitgoTransaction";
import { IBitgoTxDetails } from "./interfaces/IBitgoTxDetails";

export class BitgoClient {
  private bitgoApiurl: string;
  private jwt: string;

  constructor(apiUrl: string, jwt: string) {
    this.bitgoApiurl = apiUrl;
    this.jwt = jwt;
  }

  getHeaders(): any["headers"] {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.jwt}`,
    };
  }

  async getEthereumAccounts(): Promise<IBitgoEthereumAccount[]> {
    const headers = this.getHeaders();

    const response = await fetch(`${this.bitgoApiurl}/wallets`, {
      headers,
    });

    const contextErrorMessage = "Error fetching wallet accounts";
    const accounts: IBitgoGetEthereumAccountsResponse = await handleResponse(response, contextErrorMessage);
    return accounts.data;
  }

  async getEthereumAccountByAddress(address: string): Promise<IBitgoEthereumAccount> {
    const headers = this.getHeaders();

    const response = await fetch(`${this.bitgoApiurl}/mmi/wallets/address/${address}`, {
      headers,
    });

    const contextErrorMessage = `Error fetching account for address ${address}`;
    const accounts: IBitgoGetEthereumAccountsResponse = await handleResponse(response, contextErrorMessage);
    if (accounts.data.length) {
      return accounts.data[0];
    } else {
      return null;
    }
  }

  async createTransaction(
    bitgoTxDetails: IBitgoTxDetails,
    txParams: IEIP1559TxParams | ILegacyTXParams,
  ): Promise<IBitgoTransaction> {
    const headers = this.getHeaders();

    if (txParams.type === "0" || txParams.type === "1") {
      txParams.gasPrice = (txParams as ILegacyTXParams).gasPrice;
    } else if (txParams.type === "2") {
      txParams.maxPriorityFeePerGas = (txParams as IEIP1559TxParams).maxPriorityFeePerGas;
      txParams.maxFeePerGas = (txParams as IEIP1559TxParams).maxFeePerGas;
    }

    const response = await fetch(
      `${this.bitgoApiurl}/mmi/${bitgoTxDetails.coinId}/wallet/${bitgoTxDetails.walletId}/tx/build`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          txParams,
        }),
      },
    );

    const contextErrorMessage = "Error creating transaction";
    const resultWrapper: IBitgoCreateTransactionResponse = await handleResponse(response, contextErrorMessage);
    return resultWrapper.data;
  }

  async getTransaction(custodian_transactionId: string): Promise<IBitgoTransaction> {
    const headers = this.getHeaders();

    const response = await fetch(`${this.bitgoApiurl}/mmi/wallets/transactions/${custodian_transactionId}`, {
      headers,
    });

    const contextErrorMessage = `Error getting transaction with id ${custodian_transactionId}`;
    const transaction = await handleResponse(response, contextErrorMessage);
    return transaction.data[0];
  }

  async getTransactions(): Promise<IBitgoTransaction[]> {
    const headers = this.getHeaders();

    const response = await fetch(`${this.bitgoApiurl}/custodian/transaction`, {
      headers,
    });

    const contextErrorMessage = "Error getting transactions";
    const allTransactions = await handleResponse(response, contextErrorMessage);
    return allTransactions.data;
  }

  async getCustomerProof(): Promise<IBitgoCustomerProof> {
    const headers = this.getHeaders();

    const response = await fetch(`${this.bitgoApiurl}/mmi/customer-proof`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        version: "n/a",
      }),
    });

    const contextErrorMessage = "Error getting Customer Proof";
    const customerProof = await handleResponse(response, contextErrorMessage);
    return customerProof;
  }

  async signTypedData_v4(
    fromAddress: string,
    message: TypedMessage<MessageTypes>,
    coinId: string,
    walletId: string,
    version: string,
  ): Promise<IBitgoEIP712Response> {
    const headers = await this.getHeaders();

    const payload: IBitgoEIP712Request = {
      address: fromAddress,
      payload: message,
      encodingVersion: version || "v4",
    };

    const response = await fetch(`${this.bitgoApiurl}/mmi/${coinId}/wallet/${walletId}/messages/typed`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers,
    });

    const contextErrorMessage = `Error doing signTypedData from address: ${fromAddress}`;
    const data = await handleResponse(response, contextErrorMessage);
    return data;
  }

  async signPersonalMessage(
    fromAddress: string,
    message: string,
    coinId: string,
    walletId: string,
  ): Promise<IBitgoPersonalSignResponse> {
    const headers = await this.getHeaders();

    const payload: IBitgoPersonalSignRequest = {
      address: fromAddress,
      message,
    };

    const response = await fetch(`${this.bitgoApiurl}/mmi/${coinId}/wallet/${walletId}/messages/personal`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers,
    });

    const contextErrorMessage = `Error doing signPersonalMessage from address: ${fromAddress}`;
    const data = await handleResponse(response, contextErrorMessage);
    return data;
  }

  async getSignedMessage(
    custodian_signedMessageId: string,
    coinId: string,
    walletId: string,
  ): Promise<IBitgoPersonalSignResponse> {
    const headers = await this.getHeaders();

    const response = await fetch(
      `${this.bitgoApiurl}/mmi/${coinId}/wallet/${walletId}/messages/${custodian_signedMessageId}`,
      {
        headers,
      },
    );

    const contextErrorMessage = `Error getting signed message with id ${custodian_signedMessageId}`;
    const data = await handleResponse(response, contextErrorMessage);
    return data as IBitgoPersonalSignResponse;
  }
}
