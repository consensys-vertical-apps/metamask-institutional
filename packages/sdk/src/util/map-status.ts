interface Status {
  finished: boolean;
  signed: boolean;
  success: boolean;
  displayText: string;
  reason: string;
}
interface TransactionStatus extends Status {
  submitted: boolean;
}

export function mapTransactionStatus(status: string, reason?: string): TransactionStatus {
  switch (status) {
    case "created":
      return {
        finished: false,
        submitted: false,
        signed: false,
        success: false,
        displayText: "Created",
        reason,
      };
    case "signed":
      return {
        finished: false,
        submitted: false,
        signed: true,
        success: false,
        displayText: "Signed",
        reason,
      };
    case "submitted":
      return {
        finished: false,
        submitted: true,
        signed: true,
        success: false,
        displayText: "Submitted",
        reason,
      };
    case "mined":
      return {
        finished: true,
        submitted: true,
        signed: true,
        success: true,
        displayText: "Mined",
        reason,
      };
    case "completed":
      return {
        finished: true,
        submitted: true,
        signed: true,
        success: true,
        displayText: "Completed",
        reason,
      };
    case "failed":
      return {
        finished: true,
        submitted: true,
        signed: true,
        success: false,
        displayText: "Failed",
        reason,
      };
      break;
    case "rejected":
      return {
        finished: true,
        submitted: false,
        signed: false,
        success: false,
        displayText: "Rejected",
        reason,
      };
    case "aborted":
      return {
        finished: true,
        submitted: false,
        signed: false,
        success: false,
        displayText: "Aborted",
        reason,
      };
      break;
    case "confirmed":
      return {
        finished: true,
        submitted: true,
        signed: true,
        success: true,
        displayText: "Confirmed",
        reason,
      };
    default:
      return {
        finished: false,
        submitted: false,
        signed: false,
        success: false,
        displayText: "Unknown",
        reason,
      };
  }
}
