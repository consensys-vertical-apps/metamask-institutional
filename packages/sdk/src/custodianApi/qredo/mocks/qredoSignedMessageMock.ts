import { IQredoSignatureResponse } from "../interfaces/IQredoSignatureResponse";

export const qredoSignedMessageMock: IQredoSignatureResponse = {
  sigID: "1yXEvWxuQwzkujI5YY9TtWJag6h",
  status: "created",
  message: "some message",
  timestamps: {
    created: 1632389763,
  },
  events: [
    {
      id: "1yXEvZ6xrHEemuRdMUzTch6YbWf",
      timestamp: 1632389763,
      status: "created",
      message: "",
    },
  ],
  from: "0x",
  createdBy: "author",
  signature: "theSig",
};
