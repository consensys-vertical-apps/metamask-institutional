import { MmiConfigurationController } from "@metamask-institutional/custody-keyring";
import { EventEmitter } from "events";

import { WEBSOCKET_REQUEST_TIMEOUT } from "./constants";
import { IRequestStreamResponse } from "./interfaces/IRequestStreamResponse";
import { IWebsocketClientControllerOptions } from "./interfaces/IWebsocketClientControllerOptions";

export class WebsocketClientController extends EventEmitter {
  public websocketCLientId: number;

  public mmiConfigurationController: MmiConfigurationController;

  public onFailure: () => void;
  public captureException: (error: Error) => void;
  public handleUpdateEvent: (ev: any) => void;
  public onReconnect: () => void;
  public onWebsocketClose: () => void;

  private ws: WebSocket;
  private timerID: any;
  private RETRY_ATTEMPTS_LIMIT: number;
  private RETRY_ATTEMPTS: number;
  private retryDelay: number;

  /**
   * Creates a new Websocket client instance
   *
   * @param {WebsocketClientOptions} [opts] - Controller configuration parameters
   */
  constructor(opts: IWebsocketClientControllerOptions) {
    super(); // EventEmitter constructor

    this.handleUpdateEvent = opts.handleUpdateEvent;
    this.onFailure = opts.onFailure;
    this.mmiConfigurationController = opts.mmiConfigurationController;
    this.captureException = opts.captureException;
    this.onReconnect = opts.onReconnect;
    this.onWebsocketClose = opts.onWebsocketClose;

    this.timerID = 0;

    this.ws = null;

    this.RETRY_ATTEMPTS_LIMIT = 3;
    this.RETRY_ATTEMPTS = 0;
    this.retryDelay = 1000;
  }

  public connectWS(): void {
    const websocketApiUrl = this.mmiConfigurationController.getWebsocketApiUrl();

    try {
      this.ws = new WebSocket(websocketApiUrl);
      this.websocketCLientId = Date.now();
      console.log(`WSClient ${this.ws} created with clientId ${this.websocketCLientId}`);

      this.ws.onopen = this.onOpen.bind(this);
      this.ws.onmessage = this.onMessage.bind(this);
      this.ws.onerror = this.onError.bind(this);
      this.ws.onclose = this.onClose.bind(this);

      this.keepAlive();
      this.RETRY_ATTEMPTS = 0;
      this.retryDelay = 1000;
    } catch (error) {
      console.log("[error] WS connection error", error);
      this.tryToReconnect();
    }
  }

  // connection is ready to send and receive data
  public onOpen(event: any): void {
    console.log("[open] WS connected", event);

    // This event also fires when the connection is re-established
    this.onReconnect();
  }

  // event listener to be called when a msg is received
  public onMessage(event: MessageEvent): void {
    console.log(`[message] Data received: ${JSON.stringify(event.data)}`);

    const msg = JSON.parse(event.data);

    // Messages that have responses should be emitted as they are used to resolve promises
    if (msg.data?.requestId || msg.error?.requestId) {
      const channel = `response-${msg.data?.requestId || msg.error?.requestId}`;
      this.emit(channel, msg);
    }

    if (msg.event === "custodian_update") {
      this.handleUpdateEvent(msg.data);
    }

    if (
      msg.error &&
      !msg.error.requestId /* dont kill the connection for response, because we might handle errors cleverly */
    ) {
      this.captureException(new Error(msg.error));
      console.log(msg.error);

      this.onFailure();
    }
  }

  public sendWithResponse<T>(event: string, data: Record<string, unknown>): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = Date.now();

      data = {
        ...data,
        requestId,
      };

      const msg = {
        event,
        data,
      };

      const timeout = setTimeout(() => {
        reject(new Error(`Request ${requestId} (${event}) timed out`));
      }, WEBSOCKET_REQUEST_TIMEOUT);

      const channel = `response-${requestId}`;

      this.on(channel, response => {
        clearTimeout(timeout);

        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.data);
        }
      });

      this.ws.send(JSON.stringify(msg));
    });
  }

  // if an error occurs, first an event with the name 'error' is sent here to the WS object,
  // and then the CloseEvent is sent to indicate the reason for the connection closing.
  public onError(event: any): void {
    console.log(`[error] ${JSON.stringify(event)}`);

    this.ws.close();
  }

  // event listener to be called when the WS connection readyState changes to closed
  public onClose(event: CloseEvent): void {
    console.log(`[close] Connection closed, code=${event.code} reason=${event.reason}`);

    this.cancelKeepAlive();
    this.tryToReconnect();
  }

  tryToReconnect() {
    if (this.ws.readyState === this.ws.OPEN) {
      console.log(`[tryToReconnect] WS connection is still OPEN`);
      return;
    }

    ++this.RETRY_ATTEMPTS;

    // Check if the limit of retry attempts has been reached
    if (this.RETRY_ATTEMPTS > this.RETRY_ATTEMPTS_LIMIT) {
      // Stop trying to reconnect if the time limit has been reached
      console.log("time is up! no more reconnects");
      this.RETRY_ATTEMPTS = 0;
      this.onFailure();
      this.onWebsocketClose();
      return;
    }

    console.log(`[tryToReconnect] Going to retry again...`);
    // Random number between 0 and 5
    const randomSeconds = Math.random() * 5;

    // Increase the retry delay and adds the random number of seconds
    this.retryDelay = (this.retryDelay *= 2) + randomSeconds * 1000;

    // Will try to reconnect after the calculated delay
    setTimeout(() => {
      this.connectWS();
      console.log(`[tryToReconnect] establishing a new WS connection`);
    }, this.retryDelay);
  }

  public sendAcknowledgement(traceId: string): void {
    this.ws.send(
      JSON.stringify({
        event: "custodian_update_acknowledgement",
        data: {
          traceId,
        },
      }),
    );
  }

  public async requestStreamForCustomerProof(customerProof: string): Promise<IRequestStreamResponse> {
    return await this.sendWithResponse<IRequestStreamResponse>("request_stream", {
      customerProof,
    });
  }

  keepAlive() {
    if (this.ws.readyState == this.ws.OPEN) {
      this.ws.send(
        JSON.stringify({
          event: "marco",
        }),
      );
    }
    this.timerID = setTimeout(this.keepAlive.bind(this), 20000);
  }

  cancelKeepAlive() {
    const isConnectionOpen = this.ws.readyState == this.ws.OPEN;

    if (this.timerID && !isConnectionOpen) {
      clearTimeout(this.timerID);
    }
  }
}
