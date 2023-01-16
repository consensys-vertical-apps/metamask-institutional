export interface ISignatureDetails {
  id?: string;
  signature: string;
  status: SignatureStatus;
}

// export type SignatureStatus = '"created" | "approved" | "signed" | "scheduled" | "pushed" | "mined" | "completed" | "aborted" | "failed" | "rejected" | "override"';

// Type based on https://consensys.gitlab.io/codefi/products/mmi/mmi-custodian-integration-spec/api-documentation/
export type SignatureStatus = {
  finished: boolean;
  signed: boolean;
  success: boolean;
  displayText: string;
  reason?: string;
};
