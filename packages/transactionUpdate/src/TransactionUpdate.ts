import { CustodyKeyring, MMIConfiguration, MmiConfigurationController } from "@metamask-institutional/custody-keyring";
import { mapTransactionStatus } from "@metamask-institutional/sdk";
import {
  ConnectionRequest,
  ICustodianUpdate,
  IRefreshTokenAuthDetails,
  ISignatureDetails,
  ITokenAuthDetails,
  ITransactionDetails,
} from "@metamask-institutional/types";
import { WebsocketClientController } from "@metamask-institutional/websocket-client";
import { ObservableStore } from "@metamask/obs-store";
import { toChecksumAddress } from "ethereumjs-util";
import { EventEmitter } from "events";

import { POLL_TRANSACTION_RETRIES, TRANSACTION_POLLING_INTERVAL } from "./constants";
import { ITransactionUpdateControllerOptions } from "./interfaces/ITransactionUpdateControllerOptions";
import { IWatchedTransaction } from "./interfaces/IWatchedTransaction";

export class TransactionUpdateController extends EventEmitter {
  public store;

  public getCustodyKeyring: (address: string) => Promise<CustodyKeyring>;
  public captureException: (e: Error) => void;

  public pollForEveryAddress = false; // Whether we are polling for every address (and not just ones where we dont have a customerProof)
  public pollAddresses: string[] = []; // Addresses that we explicitly poll for (because we don't have a customerProof for them)

  public customerProofAddresses: string[] = []; // Addresses for which we are going to try and get and maintain customer proofs so we can use websockets

  public watchedTransactions: IWatchedTransaction[] = [];
  public isWSConnectionOpen = false;

  public trackingActiveByCredentials = {};
  public websocketClient: WebsocketClientController;
  public mmiConfigurationController: MmiConfigurationController;

  public pollingTaskInterval;

  /**
   * Creates a new controller instance
   *
   * @param {TransactionUpdateOptions} [opts] - Controller configuration parameters
   */
  constructor(opts: ITransactionUpdateControllerOptions) {
    super();

    this.getCustodyKeyring = opts.getCustodyKeyring;
    this.mmiConfigurationController = opts.mmiConfigurationController;

    const { initState } = opts;

    this.store = new ObservableStore({
      ...(initState || {}),
    });

    this.pollingTaskInterval = null;

    this.captureException = opts.captureException;
  }

  handleWebsocketEvent(data: ICustodianUpdate): void {
    this.handleUpdateEvent(data);
    if (data.metadata?.traceId) {
      this.websocketClient.sendAcknowledgement(data.metadata.traceId);
    }
  }

  handleUpdateEvent(data: Partial<ICustodianUpdate>): void {
    let custodianTransactionId: string = data.transaction?.id;
    const status = data.signedMessage?.status || data.transaction?.status;

    if (data.signedMessage?.id) {
      custodianTransactionId = data.signedMessage.id;
    }

    for (let i = this.watchedTransactions.length - 1; i >= 0; --i) {
      if (this.watchedTransactions[i].custodianTransactionId === custodianTransactionId && status.finished) {
        this.watchedTransactions.splice(i, 1);
      }
    }

    this.emit("custodian_event", data);
  }

  handleHandShakeEvent(data: { channelId: string }): void {
    this.emit("handshake", data);
  }

  handleConnectionRequestEvent(payload: ConnectionRequest): void {
    this.emit("connection.request", payload);
  }

  onWebsocketClose() {
    this.isWSConnectionOpen = false;
  }

  public async getCustomerProofForAddresses(addresses: string[] = []): Promise<void> {
    for (const address of addresses) {
      this.customerProofAddresses.push(address);
    }

    const tokensAlreadyUsed = []; // Refresh tokens for which we should not try to get a customer proof again
    const tokensAlreadyFailed = []; // We shouldn't continue trying to get a customer proof for an address if we have already failed to do so, but we should continue to poll for it

    if (!addresses) {
      return;
    }

    for (let i = this.customerProofAddresses.length; i--; ) {
      const address = this.customerProofAddresses[i];
      const custodyKeyring = await this.getCustodyKeyring(address);

      // Extension may be locked
      if (custodyKeyring) {
        const { authDetails } = custodyKeyring.getAccountDetails(address);

        const token = (authDetails as ITokenAuthDetails).jwt || (authDetails as IRefreshTokenAuthDetails).refreshToken;

        if (tokensAlreadyFailed.includes(token)) {
          this.pollForAddress(address);
        }

        if (tokensAlreadyUsed.includes(token)) {
          continue;
        }

        try {
          const customerProof = await custodyKeyring.getCustomerProof(address);
          const result = await this.websocketClient.requestStreamForCustomerProof(customerProof);

          console.log(`Stream opened for ${address} (and others) with for subject ${result.streamSubject}`);
        } catch (e) {
          if (/Method not found/.test(e.message)) {
            console.log("Custodian does not support customer proof");
          } else {
            this.captureException(e);
            console.log(`Unable to obtain or verify customer proof for ${address}`, e);
          }

          // Remove this address from customerProofAddresses
          this.customerProofAddresses.splice(i, 1);

          this.pollForAddress(address);

          tokensAlreadyFailed.push(token);
        }

        tokensAlreadyUsed.push(token);
      }
    }
  }

  public pollForAddress(address: string): void {
    const checkSumAdddress = toChecksumAddress(address);
    console.log("Polling for address", checkSumAdddress);
    this.pollAddresses.push(checkSumAdddress);
  }

  public async subscribeToEvents(): Promise<void> {
    console.log("Subscribing to events");

    const mmiConfiguration: MMIConfiguration = await this.mmiConfigurationController.store.getState();

    const websocketsEnabled = mmiConfiguration?.mmiConfiguration?.features?.websocketApi;

    console.log(`Websockets enabled: ${websocketsEnabled} (from feature flags)`);

    if (websocketsEnabled) {
      await this.attemptWebsocketConnection();
    } else {
      console.log("Enabling polling for all addresses because websockets are disabled");
      this.startPolling();
    }
  }

  public async attemptWebsocketConnection(): Promise<void> {
    try {
      if (!this.isWSConnectionOpen) {
        console.log("Attempting to connect to websocket server");

        this.websocketClient = new WebsocketClientController({
          handleUpdateEvent: this.handleWebsocketEvent.bind(this),
          handleHandShakeEvent: this.handleHandShakeEvent.bind(this),
          handleConnectionRequest: this.handleConnectionRequestEvent.bind(this),
          onFailure: this.startPolling.bind(this),
          mmiConfigurationController: this.mmiConfigurationController,
          captureException: this.captureException,
          onReconnect: this.getCustomerProofForAddresses.bind(this),
          onWebsocketClose: this.onWebsocketClose.bind(this),
        });

        this.websocketClient.connectWS();
        this.isWSConnectionOpen = true;
      }
    } catch (e) {
      this.captureException(e);
      console.log("Enabling polling because an exception occured while connecting to the websocket server");
      console.log(e);
      this.startPolling();
      return;
    }
  }

  startPollingTask(): void {
    this.pollingTaskInterval = setInterval(this.pollingTask.bind(this), TRANSACTION_POLLING_INTERVAL * 1000);
  }

  public prepareEventListener(custodianEventHandlerFactory): void {
    console.log("Preparing event listener");
    this.startPollingTask();

    const custodianEventHandler = custodianEventHandlerFactory();

    this.on("custodian_event", custodianEventHandler);
  }

  public async addTransactionToWatchList(
    custodianTransactionId,
    from = "",
    bufferType = "",
    isSignedMessage = false,
  ): Promise<void> {
    // It is idempotent, so we can just return if we already have it
    if (this.watchedTransactions.find(t => t.custodianTransactionId === custodianTransactionId)) {
      return;
    }

    if (!this.pollingTaskInterval) {
      this.startPollingTask();
    }

    const fromAddress = toChecksumAddress(from);

    console.log(
      `Adding transaction or signed message to watch list: ${custodianTransactionId} from ${fromAddress} with bufferType ${bufferType} and isSignedMessage ${isSignedMessage}. Polling enabled for this address? ${this.pollAddresses.includes(
        fromAddress,
      )} Global polling enabled? ${this.pollForEveryAddress}`,
    );

    this.watchedTransactions.push({
      custodianTransactionId,
      attempts: 0,
      complete: false,
      failed: false,
      from: fromAddress,
      bufferType,
      isSignedMessage,
    });
  }

  public startPolling(): void {
    this.pollForEveryAddress = true;
  }

  public async pollingTask(): Promise<void> {
    if (this.watchedTransactions.length === 0) {
      // No need to keep polling if list is empty, so stop the setInterval
      clearInterval(this.pollingTaskInterval);
      this.pollingTaskInterval = null;
      return;
    }

    for (const watchedTransaction of this.watchedTransactions) {
      const pollForTransaction = this.pollAddresses.includes(watchedTransaction.from) || this.pollForEveryAddress;

      if (!pollForTransaction) {
        continue;
      }

      if (watchedTransaction.complete || watchedTransaction.failed) {
        continue;
      }

      try {
        await this.pollForTransaction(watchedTransaction);
      } catch (e) {
        this.captureException(e);
        console.log(`Error fetching transaction ${watchedTransaction.custodianTransactionId}`, e);
        watchedTransaction.attempts++;

        if (watchedTransaction.attempts >= POLL_TRANSACTION_RETRIES) {
          console.log("Giving up on transaction", watchedTransaction.custodianTransactionId);
          watchedTransaction.failed = true;
        }
      }
    }
  }

  public async pollForTransaction(watchedTransaction: IWatchedTransaction) {
    let result: ITransactionDetails | ISignatureDetails;
    let updateEvent: Partial<ICustodianUpdate>;

    console.log(`Polling for: ${JSON.stringify(watchedTransaction)}`);

    const custodyKeyring = await this.getCustodyKeyring(watchedTransaction.from);

    if (!custodyKeyring) {
      console.info("No custody keyring found for address", watchedTransaction.from, "extension may be locked");
      return;
    }

    if (watchedTransaction.isSignedMessage) {
      // Will call getSignedMessage from custodianApi
      result = await custodyKeyring.getSignature(watchedTransaction.from, watchedTransaction.custodianTransactionId);

      updateEvent = {
        signedMessage: {
          id: watchedTransaction.custodianTransactionId,
          address: watchedTransaction.from,
          signatureVersion: watchedTransaction.bufferType,
          signature: result?.signature,
          status: result.status,
        },
      };
    } else {
      result = await custodyKeyring.getTransaction(watchedTransaction.from, watchedTransaction.custodianTransactionId);

      const statusObject = mapTransactionStatus(result.transactionStatus);

      // At the moment this kind of duplicates logic from getCustodianTransactions()

      updateEvent = {
        transaction: {
          id: watchedTransaction.custodianTransactionId,
          hash: result.transactionHash,
          status: statusObject,
          from: result.from,
          gasPrice: result.gasPrice,
          nonce: result.nonce,
          to: result.to,
          value: result.value,
          data: result.data,
          gas: result.gasLimit,
          type: null, // FIXME : cannot be obtained from getTransaction
        },
      };
    }

    this.handleUpdateEvent(updateEvent);
  }
}
