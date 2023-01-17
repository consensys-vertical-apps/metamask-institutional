import { INetwork } from "../interfaces/INetwork";
import { NetworkMappings } from "./NetworkMappings";

describe("NetworkMappings", () => {
  const mappings = new NetworkMappings();

  describe("#getMappingByChainId", () => {
    it("will return a correct mapping for a network that exists", () => {
      expect(mappings.getMappingByChainId("1").chainId).toEqual("1");
    });

    it("will safely return 0 if it doesnt", () => {
      expect(mappings.getMappingByChainId("9999121").chainId).toEqual("0");
    });
  });

  describe("#getMappingsByCustodianName", () => {
    it("will return a correct mapping for a network that exists", () => {
      expect(
        mappings.getMappingByCustodianName("ETHEREUM_MAINNET").chainId
      ).toEqual("1");
    });

    it("will safely return 0 if it doesnt", () => {
      expect(
        mappings.getMappingByCustodianName("YELLOW_BITCOINZ").chainId
      ).toEqual("0");
    });
  });

  describe("#populateMappings", () => {
    it("will add a new network mapping if the chainId doesnt exist", () => {
      const newMapping: INetwork = {
        chainId: "666",
        name: "name",
        custodianId: "custodianId",
        custodianName: "custodianNam",
      };

      mappings.populateMappings([newMapping]);

      expect(
        mappings.mappings.find((net) => net.chainId === newMapping.chainId)
      ).toEqual(newMapping);
    });
  });
});
