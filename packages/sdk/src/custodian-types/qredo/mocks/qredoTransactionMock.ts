import { IQredoTransaction } from "../interfaces/IQredoTransaction";

export const qredoTransactionMock: IQredoTransaction = {
  txID: "1yXEvWxuQwzkujI5YY9TtWJag6h",
  txHash: "0xeecb6c2187a74c9ef15fc43453172a68071a2b7d3db067188bc518e99b9017b2",
  status: "created",
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
  nonce: 0,
  gasPrice: "1100000013",
  gasLimit: "21000",
  rawTX: "z4CEQZCrDYJSCICAgICAgA",
  from: null,
};
