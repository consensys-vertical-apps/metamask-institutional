import { MetaMaskTransactionStatuses } from "@metamask-institutional/types";
import { ITransactionStatusMap } from "@metamask-institutional/types";

export const CactusStatusMap: ITransactionStatusMap = {
  created: {
    mmStatus: MetaMaskTransactionStatuses.APPROVED,
    shortText: "Created",
    longText: "Created",
    finished: false,
  },
  approved: {
    mmStatus: MetaMaskTransactionStatuses.APPROVED,
    shortText: "Created",
    longText: "Created",
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
  completed: {
    mmStatus: MetaMaskTransactionStatuses.CONFIRMED,
    shortText: "Completed",
    longText: "Completed",
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
    shortText: "Rejected",
    longText: "Rejected",
    finished: true,
  },
  failed: {
    mmStatus: MetaMaskTransactionStatuses.FAILED,
    shortText: "Failed",
    longText: "Failed",
    finished: true,
  },
  overriden: {
    mmStatus: MetaMaskTransactionStatuses.FAILED,
    shortText: "Overriden",
    longText: "Overriden",
    finished: true,
  },
};
