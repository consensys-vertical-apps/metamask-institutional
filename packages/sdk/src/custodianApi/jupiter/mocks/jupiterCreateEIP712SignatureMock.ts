import { IJupiterEIP712SignatureResponse } from "../interfaces/IJupiterEIP712SignatureResponse";

export const jupiterCreateEIP712SignatureMock: IJupiterEIP712SignatureResponse = {
  from: "0xb2c77973279baaaf48c295145802695631d50c01",
  createdTimestamp: "2021-07-27T10:14:17.400Z",
  signedTimestamp: null,
  abortedTimestamp: null,
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
  signature: null,
  ethereumAccount: {
    id: "bedaa9d5-3793-5a21-befa-9f1fb280f75e",
    createdAt: "2021-07-27T10:07:16.710Z",
    updatedAt: "2021-07-27T10:07:16.710Z",
    address: "0xb2c77973279baaaf48c295145802695631d50c01",
    label: "Impressive Detail Content",
    chainId: 4,
  },
  transactionStatus: "created",
  userId: "12345678-1234-5678-1234-567812345678",
  signatureVersion: "V4",
  id: "a240277e-c297-4403-98e3-5975f666a7ad",
  createdAt: "2021-07-27T10:14:17.416Z",
  updatedAt: "2021-07-27T10:14:17.416Z",
};
