import { CustodyController, toChecksumHexAddress } from "@metamask-institutional/custody-controller";
import { CustodyKeyring } from "@metamask-institutional/custody-keyring";
import { mapTransactionStatus } from "@metamask-institutional/sdk";
import { TransactionUpdateController } from "@metamask-institutional/transaction-update";
import { ICustodianUpdate, MetamaskTransaction, MetaMaskTransactionStatuses } from "@metamask-institutional/types";

// This is to emulate the events in the TransactionController
// which are used to report transaction lifecycle events to metametrics
// So that we can use metamask's mixpanel templates

const TRANSACTION_EVENTS: { [key in MetaMaskTransactionStatuses]: string } = {
  [MetaMaskTransactionStatuses.ADDED]: "Transaction Added",
  [MetaMaskTransactionStatuses.APPROVED]: "Transaction Approved",
  [MetaMaskTransactionStatuses.SIGNED]: "Transaction Signed",
  [MetaMaskTransactionStatuses.REJECTED]: "Transaction Rejected",
  [MetaMaskTransactionStatuses.FAILED]: "Transaction Failed",
  [MetaMaskTransactionStatuses.SUBMITTED]: "Transaction Submitted",
  [MetaMaskTransactionStatuses.CONFIRMED]: "Transaction Confirmed",
  [MetaMaskTransactionStatuses.UNAPPROVED]: "Transaction Unapproved",
  [MetaMaskTransactionStatuses.DROPPED]: "Transaction Dropped",
  [MetaMaskTransactionStatuses.FINALIZED]: "Transaction Finalized",
};

interface UpdateCustodianTransactionsParameters {
  keyring: CustodyKeyring;
  type: string;
  txList: any[];
  custodyController: CustodyController;
  transactionUpdateController: TransactionUpdateController;
  txStateManager: any;
  getPendingNonce: (string) => Promise<number>;
  setTxHash: (number, string) => void;
}

// This is run when the extension is unlocked
// It is called once per keyring!!

export async function updateCustodianTransactions({
  keyring,
  type,
  txList,
  custodyController,
  transactionUpdateController, // If transactions are still not finished, we need to continue polling for them
  txStateManager,
  getPendingNonce,
  setTxHash,
}: UpdateCustodianTransactionsParameters): Promise<void> {
  const txStatusMap = keyring.getStatusMap();
  await Promise.all(
    txList.map(async tx => {
      if (tx.custodyId && !(tx.custodyStatus && txStatusMap[tx.custodyStatus]?.finished)) {
        // Do not fetch transactions that are not from this custodian
        if (custodyController.getCustodyTypeByAddress(toChecksumHexAddress(tx.txParams.from)) !== type) {
          return;
        }

        const custodyTx = await keyring.getTransaction(tx.txParams.from, tx.custodyId);
        if (custodyTx === null) {
          return;
        }

        // FIXME: This should be done in the custodianAPI level
        const status = mapTransactionStatus(custodyTx.transactionStatus);

        const updateEvent = {
          transaction: {
            id: custodyTx.custodian_transactionId,
            hash: custodyTx.transactionHash,
            status,
            from: custodyTx.from,
            gasPrice: custodyTx.gasPrice,
            nonce: custodyTx.nonce,
            to: custodyTx.to,
            value: custodyTx.value,
            data: custodyTx.data,
            gas: custodyTx.gasLimit,
            type: null, // FIXME: We cant get this from all custodian APIs at the moment
          },
          metadata: null,
        };

        await handleTxStatusUpdate(updateEvent, txStateManager, getPendingNonce, setTxHash);

        // If tx is not finished, we need to continue polling for it
        if (!status.finished) {
          transactionUpdateController.addTransactionToWatchList(
            custodyTx.custodian_transactionId,
            custodyTx.from,
            null,
            false,
          );
        }
      }
    }),
  );
  custodyController.storeCustodyStatusMap(keyring.type.split(" - ")[1], txStatusMap);
}

interface CustodianEventHandlerFactoryParameters {
  getState: () => any;
  log: any;
  getPendingNonce: (string) => Promise<number>;
  setTxHash: (number, string) => void;
  signatureController: any;
  txStateManager: any;
  custodyController: CustodyController;
  trackTransactionEvent: (txMeta: MetamaskTransaction, string) => void;
}

// Process transaction/signature update events from MMI API

export function custodianEventHandlerFactory({
  getState,
  log,
  getPendingNonce,
  setTxHash,
  signatureController,
  txStateManager,
  custodyController,
  trackTransactionEvent,
}: CustodianEventHandlerFactoryParameters): (txData: ICustodianUpdate) => void {
  return async (txData: ICustodianUpdate) => {
    let address;
    if (
      Object.hasOwnProperty.call(txData, "transaction") &&
      txData.transaction !== null &&
      Object.hasOwnProperty.call(txData.transaction, "from")
    ) {
      address = txData.transaction.from;
    } else if (
      Object.hasOwnProperty.call(txData, "signedMessage") &&
      txData.signedMessage !== null &&
      Object.hasOwnProperty.call(txData.signedMessage, "address")
    ) {
      address = txData.signedMessage.address;
    }
    const custodyType = custodyController.getCustodyTypeByAddress(toChecksumHexAddress(address));

    if (!custodyType) {
      log.info(`Got an update for an address I do not own: ${address}`);
      return getState();
    }

    if (!Object.hasOwnProperty.call(txData, "signedMessage") && !txData.transaction) {
      return getState();
    }
    if (Object.hasOwnProperty.call(txData, "signedMessage") && txData.signedMessage !== null) {
      console.log("Update for message:", txData.signedMessage.id, txData.signedMessage.status);

      // Close DeepLink modal if any kind of signature is signed from custodian side
      if (txData.signedMessage.signature) {
        custodyController.setWaitForConfirmDeepLinkDialog(false);
      }

      const allMessages = signatureController.messages;
      const filteredItem = Object.keys(allMessages)
        .map(key => allMessages[key])
        .find(item => item.metadata?.custodian_transactionId === txData.signedMessage.id);

      if (!filteredItem) {
        return;
      }

      const messageId = filteredItem.id;

      if (txData.signedMessage.signature && txData.signedMessage.signature != "0x") {
        return signatureController.setDeferredSignSuccess(messageId, txData.signedMessage.signature);
      } else if (txData.signedMessage.status.finished && !txData.signedMessage.status.success) {
        return signatureController.setDeferredSignError(messageId);
      }

      return;
    }

    // It is a transaction
    console.log("Update for transaction: ", txData.transaction.id, txData.transaction.status);

    const txMeta = await handleTxStatusUpdate(txData, txStateManager, getPendingNonce, setTxHash);

    if (!txMeta) {
      // Most likely this is not for us (the transaction was initiated by another user who has the same custodian account)
      return;
    }

    if (TRANSACTION_EVENTS[txMeta.status]) {
      try {
        trackTransactionEvent(txMeta, TRANSACTION_EVENTS[txMeta.status]);
      } catch (error) {
        // Sometimes we can't track things because they happen while the extension is locked
        log.error(error);
      }
    }

    console.log("custodianEventHandler finished, txMeta:", txMeta);
  };
}

interface ShowCustodianDeepLinkParameters {
  dispatch: (any) => any;
  mmiActions: any;
  txId: string;
  fromAddress: string;
  closeNotification: boolean;
  isSignature: boolean;
  custodyId: string;
  onDeepLinkFetched: () => any;
  onDeepLinkShown: () => any;
  showCustodyConfirmLink: (any) => any;
}

export async function showCustodianDeepLink({
  dispatch,
  mmiActions,
  txId,
  fromAddress,
  closeNotification,
  isSignature,
  custodyId,
  onDeepLinkFetched,
  onDeepLinkShown,
  showCustodyConfirmLink,
}: ShowCustodianDeepLinkParameters): Promise<void> {
  let deepLink;
  let custodianTxId = custodyId;
  if (isSignature) {
    const link = await dispatch(mmiActions.getCustodianSignMessageDeepLink(fromAddress, custodyId));
    deepLink = link;
  } else {
    const result = await dispatch(mmiActions.getCustodianConfirmDeepLink(txId));
    deepLink = result.deepLink;
    custodianTxId = result.custodyId;
  }
  onDeepLinkFetched();
  try {
    await dispatch(
      showCustodyConfirmLink({
        link: deepLink,
        address: fromAddress,
        closeNotification: closeNotification,
        custodyId: custodianTxId,
      }),
    );
    dispatch(mmiActions.setWaitForConfirmDeepLinkDialog(true));
    onDeepLinkShown();
  } catch (e) {
    dispatch(mmiActions.setWaitForConfirmDeepLinkDialog(false));
  }
}

export function getTxByCustodyId(getTransactions: ({ searchCriteria }) => any[], txCustodyId: string): any {
  const searchCriteria = { custodyId: txCustodyId };
  const found = getTransactions({ searchCriteria });
  if (found.length) {
    return found[0];
  }
  return undefined;
}

export async function handleTxStatusUpdate(
  txData: ICustodianUpdate,
  txStateManager: any,
  getPendingNonce: (address: string) => Promise<number>,
  setTxHash: (txId: number, txHash: string) => void,
): Promise<MetamaskTransaction> {
  const txMeta = getTxByCustodyId(
    ({ searchCriteria }) => txStateManager.getTransactions({ searchCriteria }),
    txData.transaction.id,
  ) as MetamaskTransaction;

  if (txMeta) {
    txMeta.custodyStatus = txData.transaction.status.displayText.toLowerCase();
    txMeta.custodyStatusDisplayText = txData.transaction?.status.displayText;

    if (txData.transaction.hash && (!txMeta.hash || txMeta.hash === "0x")) {
      setTxHash(txMeta.id, txData.transaction.hash);
    }

    // Transaction is signed, or in many intermediate post signing states
    if (
      txData.transaction.status.signed &&
      !txData.transaction.status.finished &&
      txMeta.status !== MetaMaskTransactionStatuses.SIGNED &&
      txMeta.status !== MetaMaskTransactionStatuses.SUBMITTED &&
      txMeta.status !== MetaMaskTransactionStatuses.CONFIRMED &&
      txMeta.status !== MetaMaskTransactionStatuses.FAILED
    ) {
      txStateManager.setTxStatusSigned(txMeta.id);
    }

    if (
      !txMeta.txParams.nonce ||
      (txData.transaction.nonce && Number(txMeta.txParams.nonce) !== Number(txData.transaction.nonce))
    ) {
      const nonce =
        "0x" + (parseInt(txData.transaction.nonce) || (await getPendingNonce(txData.transaction.from))).toString(16);

      const newTxParams = await {
        ...txMeta.txParams,
        nonce,
      };
      txMeta.txParams = newTxParams;
    }

    // Metamask resolves the promise in transaction controller when the TX is submitted
    // So we can yield control back to that function as early as we can

    /**
     * Previously, we were waiting for transaction confirmation from custodians before yielding
     * We are now yielding on submission
     * This has two effects
     * 1. Interaction is yieled by MMI back to the dapp before confirmation, meaning it is much quicker
     * 2. On-chain failures do not cause the dapp's RPC promise to be rejected, which is more in line with MetaMask's behaviour
     * */

    // We don't need to wait for the custodian to confirm the TX, since MM's internal
    // block tracker will do that for us

    // Sometimes custodians do not send a webhook when a transaction is submitted -
    // They may only send one when the TX is confirmed (e.g. Safe) so we need to handle
    // submission the same as confirmation
    const looksLikeFinalUpdate =
      txData.transaction.status.finished &&
      txData.transaction.status.success &&
      txMeta.status !== MetaMaskTransactionStatuses.CONFIRMED;

    /* Sometimes we get updates AFTER a TX is confirmed, so we have to be careful not to "revert this" but otherwise we should set submitted when its submitted */

    const looksLikeRealSubmission =
      txData.transaction.status.submitted && txMeta.status !== MetaMaskTransactionStatuses.CONFIRMED;

    if (looksLikeFinalUpdate || looksLikeRealSubmission) {
      txStateManager.setTxStatusSubmitted(txMeta.id);
      txStateManager.setTxStatusConfirmed(txMeta.id);
    } else if (txData.transaction.status.finished && !txData.transaction.status.success) {
      let message = `Transaction status from custodian: ${txMeta.custodyStatusDisplayText}`; // Clever English language hack IMO

      if (txData.transaction.status.reason) {
        message = txData.transaction.status.reason;
      }
      txStateManager.setTxStatusFailed(txMeta.id, message);
    }

    txStateManager.updateTransaction(txMeta, "Updated custody transaction status.");

    return txMeta;
  }
  return null;
}
