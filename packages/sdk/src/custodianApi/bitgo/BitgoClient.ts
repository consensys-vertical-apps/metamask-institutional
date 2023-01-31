import { IEIP1559TxParams, ILegacyTXParams } from "@metamask-institutional/types";

import { CustodianApiError } from "../../errors/CustodianApiError";
import { MessageTypes, TypedMessage } from "../../interfaces/ITypedMessage";
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

    try {
      const body = await fetch(`${this.bitgoApiurl}/wallets`, {
        headers,
      });

      const accounts: IBitgoGetEthereumAccountsResponse = await body.json();
      return accounts.data;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async getEthereumAccountByAddress(address: string): Promise<IBitgoEthereumAccount> {
    const headers = this.getHeaders();

    try {
      const body = await fetch(`${this.bitgoApiurl}/mmi/wallets/address/${address}`, {
        headers,
      });
      const accounts: IBitgoGetEthereumAccountsResponse = await body.json();
      if (accounts.data.length) {
        return accounts.data[0];
      } else {
        return null;
      }
    } catch (e) {
      throw new CustodianApiError(e);
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

    try {
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

      const resultWrapper: IBitgoCreateTransactionResponse = await response.json();
      return resultWrapper.data;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async getTransaction(custodian_transactionId: string): Promise<IBitgoTransaction> {
    const headers = this.getHeaders();

    try {
      const response = await fetch(`${this.bitgoApiurl}/mmi/wallets/transactions/${custodian_transactionId}`, {
        headers,
      });

      const transaction = await response.json();
      return transaction.data[0];
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async getTransactions(): Promise<IBitgoTransaction[]> {
    const headers = this.getHeaders();

    try {
      const response = await fetch(`${this.bitgoApiurl}/custodian/transaction`, {
        headers,
      });

      const allTransactions = await response.json();
      return allTransactions.data;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }

  async getCustomerProof(): Promise<IBitgoCustomerProof> {
    const headers = this.getHeaders();

    try {
      const response = await fetch(`${this.bitgoApiurl}/mmi/customer-proof`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          version: "n/a",
        }),
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
    coinId: string,
    walletId: string,
  ): Promise<IBitgoEIP712Response> {
    const headers = await this.getHeaders();

    const payload: IBitgoEIP712Request = {
      address: fromAddress,
      payload: message,
    };

    try {
      const response = await fetch(`${this.bitgoApiurl}/mmi/${coinId}/wallet/${walletId}/messages/typed`, {
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

    try {
      const response = await fetch(`${this.bitgoApiurl}/mmi/${coinId}/wallet/${walletId}/messages/personal`, {
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

  async getSignedMessage(
    custodian_signedMessageId: string,
    coinId: string,
    walletId: string,
  ): Promise<IBitgoPersonalSignResponse> {
    const headers = await this.getHeaders();

    try {
      const response = await fetch(
        `${this.bitgoApiurl}/mmi/${coinId}/wallet/${walletId}/messages/${custodian_signedMessageId}`,
        {
          headers,
        },
      );

      const data = await response.json();

      return data as IBitgoPersonalSignResponse;
    } catch (e) {
      throw new CustodianApiError(e);
    }
  }
}
