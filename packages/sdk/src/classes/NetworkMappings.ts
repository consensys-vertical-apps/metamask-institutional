import { INetwork } from "../interfaces/INetwork";

const defaultMappings: INetwork[] = [
  {
    name: "Mainnet",
    custodianName: "ETHEREUM_MAINNET",
    custodianId: "d8e36489-4561-4062-822b-9245eadd20c0",
    chainId: "1",
  },
  {
    name: "Ropsten",
    custodianName: "ETHEREUM_ROPSTEN",
    custodianId: "13323143-efa4-4733-b4e6-79e384a39fdd",
    chainId: "3",
  },
  {
    name: "Kovan",
    custodianName: "ETHEREUM_KOVAN",
    custodianId: "6b40f106-c0b5-4d04-85df-ec772253f0f4",
    chainId: "42",
  },
  {
    name: "Ethereum Classic",
    custodianName: "ETHEREUM_CLASSIC_MAINNET",
    custodianId: "043f3fb5-53ed-4c8a-a508-765634a6b354",
    chainId: "61",
  },
];

export class NetworkMappings {
  constructor(mappings = defaultMappings) {
    this.populateMappings(mappings);
  }

  mappings: INetwork[] = [];

  // Add mappings but only the ones that are not there already
  populateMappings(newMappings: INetwork[]): void {
    this.mappings = this.mappings.concat(
      newMappings.filter(
        mapping => !this.mappings.find(existingMapping => mapping.chainId === existingMapping.chainId),
      ),
    );
  }

  unsupportedMapping(prop: string | number): INetwork {
    console.warn("Unsupported network: " + prop.toString());
    return {
      chainId: "0",
      name: "Unsupported",
      custodianName: "Unsupported",
      custodianId: "00000000-0000-0000-0000-000000000000",
    };
  }

  getMappingByChainId(chainId: string): INetwork {
    const network = this.mappings.find(mapping => mapping.chainId == chainId);
    return network || this.unsupportedMapping(chainId);
  }

  getMappingByCustodianName(custodianName: string): INetwork {
    const network = this.mappings.find(mapping => mapping.custodianName == custodianName);
    return network || this.unsupportedMapping(custodianName);
  }
}
