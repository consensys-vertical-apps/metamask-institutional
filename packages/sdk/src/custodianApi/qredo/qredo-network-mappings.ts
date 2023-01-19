import { INetwork } from "../../interfaces/INetwork";

export const qredoNetworkMappings: INetwork[] = [
  {
    name: "Mainnet",
    custodianName: "eth-mainnet",
    custodianId: "eth-mainnet",
    chainId: "1",
  },
  {
    name: "Ropsten",
    custodianName: "eth-ropsten",
    custodianId: "eth-ropsten",
    chainId: "3",
  },
];
