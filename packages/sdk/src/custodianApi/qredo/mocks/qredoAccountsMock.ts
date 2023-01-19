import { IQredoEthereumAccount } from "../interfaces/IQredoEthereumAccount";

export const qredoAccountsMock: IQredoEthereumAccount[] = [
  {
    walletID: "7bJtsQbTybUvAArd79m1nHiSUoywm5eosNpJCjZ5oJSF",
    network: "eth-ropsten",
    address: "0xcC3A716A80415a6292cFf4FfEf761d76955b4b67",
    labels: [
      {
        key: "fund-name",
        name: "Fund name",
        value: "Test Fund",
      },
      {
        key: "wallet-name",
        name: "Wallet name",
        value: "Test Wallet 1",
      },
    ],
  },
  {
    walletID: "6h2L5K8H9DQM8YbFsspnY8Sz3h7uB8bKD3moRmo5NAM4",
    network: "eth-ropsten",
    address: "0xe28eA32a2383b86581a0898305Fc570D004AC56B",
    labels: [
      {
        key: "fund-name",
        name: "Fund name",
        value: "Test Fund",
      },
      {
        key: "wallet-name",
        name: "Wallet name",
        value: "Amazing wallet",
      },
    ],
  },
];
