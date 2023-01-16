export type QredoTransactionEvent = {
  id: string;
  timestamp: number;
  status: string;
  message: string;
};

export type QredoTransactionStatus =
  | "pending"
  | "created"
  | "authorized"
  | "approved"
  | "expired"
  | "cancelled"
  | "rejected"
  | "signed"
  | "scheduled"
  | "pushed"
  | "confirmed"
  | "mined"
  | "failed";
