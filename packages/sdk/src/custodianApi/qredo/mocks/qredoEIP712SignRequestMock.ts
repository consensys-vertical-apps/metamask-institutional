import { IQredoSignatureRequest } from "../interfaces/IQredoSignatureRequest";

export const qredoEIP712SignRequestMock: IQredoSignatureRequest = {
  from: "0x9d4e1967bdc5d3c71f633cfa8a0584981a5f5621",
  payload: {
    domain: {
      chainId: 4,
      name: "Test Stuff",
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      version: "1",
    },
    message: {
      contents: "Hello, World!",
      to: {
        name: "Bob",
        wallet: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      },
    },
    primaryType: "Message",
    types: {
      EIP712Domain: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "version",
          type: "string",
        },
        {
          name: "chainId",
          type: "uint256",
        },
        {
          name: "verifyingContract",
          type: "address",
        },
      ],
      Message: [
        {
          name: "contents",
          type: "string",
        },
        {
          name: "to",
          type: "Person",
        },
      ],
      Person: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "wallet",
          type: "address",
        },
      ],
    },
  },
};
