import { IQredoSignatureResponse } from "../interfaces/IQredoSignatureResponse";

export const qredoPersonalSignResponseMock: IQredoSignatureResponse = {
  sigID: "25WHsNRy6O472ObI0Hvzzw6lW52",
  from: "0x9d4e1967bdc5d3c71f633cfa8a0584981a5f5621",
  message: "0x4578616d706c652060706572736f6e616c5f7369676e60206d657373616765",
  status: "created",
  timestamps: { created: 1645636127 },
  events: [
    {
      id: "25WHsLyPQNmH4rvsy9UCxqC6s1Z",
      timestamp: 1645636127,
      status: "created",
      message: "",
    },
  ],
  signature: "",
  createdBy: "2SvxTKt8Ga1aBKksQUcyMQSAhBg6pbVTNpEyukmuTtqj",
};
