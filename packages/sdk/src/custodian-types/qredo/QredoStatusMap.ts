import { MetaMaskTransactionStatuses } from "../../enum/MetaMaskTransactionStatuses";
import { ITransactionStatusMap } from "../../interfaces/ITransactionStatusMap";

// FIXME

export const QredoStatusMap: ITransactionStatusMap = {
  created: {
    mmStatus: MetaMaskTransactionStatuses.APPROVED,
    shortText: "Created",
    longText: "Created",
    finished: false,
  },
  pending: {
    mmStatus: MetaMaskTransactionStatuses.APPROVED,
    shortText: "Pending",
    longText: "Pending",
    finished: false,
  },
  approved: {
    mmStatus: MetaMaskTransactionStatuses.APPROVED,
    shortText: "Authorized",
    longText: "Authorized",
    finished: false,
  },
  authorized: {
    mmStatus: MetaMaskTransactionStatuses.APPROVED,
    shortText: "Authorized",
    longText: "Authorized",
    finished: false,
  },
  signed: {
    mmStatus: MetaMaskTransactionStatuses.SIGNED,
    shortText: "Signed",
    longText: "Signed",
    finished: false,
  },
  scheduled: {
    mmStatus: MetaMaskTransactionStatuses.SIGNED,
    shortText: "Submitted",
    longText: "Waiting for block",
    finished: false,
  },
  pushed: {
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
  confirmed: {
    mmStatus: MetaMaskTransactionStatuses.CONFIRMED,
    shortText: "Mined",
    longText: "Mined",
    finished: true,
  },
  cancelled: {
    mmStatus: MetaMaskTransactionStatuses.FAILED,
    shortText: "Aborted",
    longText: "Aborted",
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
  expired: {
    mmStatus: MetaMaskTransactionStatuses.FAILED,
    shortText: "Failed",
    longText: "Failed",
    finished: true,
  },
};
