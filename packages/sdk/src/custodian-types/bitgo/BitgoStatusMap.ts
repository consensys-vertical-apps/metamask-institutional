import { MetaMaskTransactionStatuses } from "@metamask-institutional/types";
import { ITransactionStatusMap } from "@metamask-institutional/types";

export const BitgoStatusMap: ITransactionStatusMap = {
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
  completed: {
    mmStatus: MetaMaskTransactionStatuses.CONFIRMED,
    shortText: "Mined",
    longText: "Mined",
    finished: false,
  },
  mined: {
    // Used when bitgo sends V2 webhooks
    mmStatus: MetaMaskTransactionStatuses.CONFIRMED,
    shortText: "Mined",
    longText: "Mined",
    finished: false,
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
};
