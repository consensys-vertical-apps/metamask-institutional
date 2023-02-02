// Shamelessley stolen from https://github.com/MetaMask/eth-sig-util/blob/master/src/index.ts

interface MessageTypeProperty {
  name: string;
  type: string;
}

export interface MessageTypes {
  EIP712Domain: MessageTypeProperty[];
  [additionalProperties: string]: MessageTypeProperty[];
}

export interface TypedMessage<T extends MessageTypes> {
  types: T;
  primaryType: keyof T;
  domain: {
    name?: string;
    version?: string;
    chainId?: number;
    verifyingContract?: string;
  };
  message: Record<string, unknown>;
}
