// Currently we are asking that JSON-RPC custodians are returning
// statuses in an object containing booleans
// But we are still depending on status strings on the frontend
// This is a temporary fix until we can get rid of the status strings and support the booleans on the frontend
import { TransactionStatus } from "@metamask-institutional/types";

interface StatusDictionary {
  finished: boolean;
  submitted?: boolean;
  signed: boolean;
  success: boolean;
  displayText: string;
}

export function mapStatusObjectToStatusText(status: StatusDictionary): TransactionStatus {
  if (status.finished && status.submitted && status.signed && status.success) {
    return "mined";
  }

  if (status.finished && status.submitted && status.signed && !status.success) {
    return "failed";
  }

  if (status.submitted && !status.finished) {
    return "submitted";
  }

  if (status.signed && !status.submitted) {
    return "signed";
  }

  if (!status.signed && !status.finished) {
    return "created";
  }

  if (!status.signed && status.finished) {
    return "aborted";
  }
}
