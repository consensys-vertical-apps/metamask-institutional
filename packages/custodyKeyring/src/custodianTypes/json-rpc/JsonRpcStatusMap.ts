import { ITransactionStatusMap, MetaMaskTransactionStatuses } from "@metamask-institutional/types";

// FIXME: This is temporary until we can get the
// status objects as defined in the JSON RPC spec
// into the codebase.

export const JsonRpcStatusMap: ITransactionStatusMap = {
  created: {
    mmStatus: MetaMaskTransactionStatuses.APPROVED,
    shortText: "Created",
    longText: "Created",
    finished: false,
  },
  signed: {
    mmStatus: MetaMaskTransactionStatuses.SIGNED,
    shortText: "Signed",
    longText: "Signed",
    finished: false,
  },
  submitted: {
    mmStatus: MetaMaskTransactionStatuses.SUBMITTED,
    shortText: "Submitted",
    longText: "Waiting for block",
    finished: false,
  },
  mined: {
    mmStatus: MetaMaskTransactionStatuses.CONFIRMED,
    shortText: "Mined",
    longText: "Mined",
    finished: true,
  },
  aborted: {
    mmStatus: MetaMaskTransactionStatuses.FAILED,
    shortText: "Aborted",
    longText: "Aborted",
    finished: true,
  },
  rejected: {
    mmStatus: MetaMaskTransactionStatuses.FAILED,
    shortText: "Aborted",
    longText: "Aborted",
    finished: true,
  },
  failed: {
    mmStatus: MetaMaskTransactionStatuses.FAILED,
    shortText: "Failed",
    longText: "Failed",
    finished: true,
  },
  completed: {
    // Bitgo
    mmStatus: MetaMaskTransactionStatuses.CONFIRMED,
    shortText: "Mined",
    longText: "Mined",
    finished: true,
  },
};
