// These are the same types as the entities EthereumTransaction and EthereumSignature in MMI API, that is where they originate

interface EthereumSignature {
  id: string;

  custodian_transactionId: string;

  transactionStatus: string;

  createdTimestamp: Date;

  signedTimestamp: Date;

  abortedTimestamp: Date;

  failedTimestamp: Date;

  failureReason: string;

  network: string;

  signed_content: string;

  buffer_type: string;

  decoded?: string;

  from: string;
}

interface EthereumTransaction {
  id: string;

  custodian_transactionId: string;

  transactionHash: string;

  transactionStatus: string;

  transactionStatusDisplayText: string;

  createdTimestamp: Date;

  signedTimestamp: Date;

  abortedTimestamp: Date;

  failedTimestamp: Date;

  failureReason: string;

  to: string;

  from: string;

  value: string;

  data: string;

  gasUsed: string;

  fees: string;

  gasLimit: string;

  gasPrice: string;

  network: string;

  nonce: string;
}

export interface IUpdateEvent {
  userId?: string;
  transaction?: EthereumTransaction;
  signature?: EthereumSignature;
}
