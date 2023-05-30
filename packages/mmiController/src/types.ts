import { TransactionUpdateController } from "@metamask-institutional/transaction-update";
import { MetamaskTransaction } from "@metamask-institutional/types";
import { Json } from "@metamask/controller-utils";
import { KeyringController as EthKeyringController } from "@metamask/eth-keyring-controller";
import { AbstractMessage } from "@metamask/message-manager";

export type OldTransactionController = {
  setTxHash: (txId: string, txHash: string) => void;
  _trackTransactionMetricsEvent: (txMeta: MetamaskTransaction, event: string) => void;
  txStateManager: {
    getTransactions: (a: any, b: any, c: any) => any;
    getTransaction: (txId: string) => MetamaskTransaction;
  };
  getTransaction: (txId: string) => MetamaskTransaction;
};

export type MMIControllerOptions = {
  keyringController: EthKeyringController;
  txController: OldTransactionController;
  appStateController: any;
  accountTracker: any;
  metaMetricsController: any;
  transactionUpdateController: TransactionUpdateController;
  platform: any;
  extension: any;
  securityProviderRequest: (requestData: AbstractMessage, messageType: string) => Promise<Json>;
  getState: () => void;
  getPendingNonce: (address: string) => Promise<number>;
  getPermissionBackgroundApiMethods: (permissionController: any) => {
    addPermittedAccount: (origin: any, account: any) => void;
    removePermittedAccount: (origin: any, account: any) => void;
    requestAccountsPermissionWithId: (origin: any) => Promise<any>;
  };
};
