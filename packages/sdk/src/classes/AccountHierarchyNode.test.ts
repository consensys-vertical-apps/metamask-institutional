import { getMockAccountHierarchy } from "../mocks/accountHierarchyMock";
import { AccountHierarchyNode } from "./AccountHierarchyNode";

describe("AccountHierarchyNode", () => {
  describe("AccountHierarchyNode#constructor", () => {
    it("should assign the parameters as properties", () => {
      const achn = new AccountHierarchyNode("type", "id", "name", undefined);
      expect(achn.type).toBe("type");
      expect(achn.id).toBe("id");
      expect(achn.name).toBe("name");
      expect(achn.parent).toBe(null);
    });
  });

  describe("AccountHierarchyNode#serialize", () => {
    it("removes the parents from every node in the tree and returns the (mutated) tree", () => {
      let mockACHN = getMockAccountHierarchy();

      mockACHN = mockACHN.serialize();

      for (const child of mockACHN.children) {
        expect(child.parent).toBeUndefined;
        for (const grandChild of child.children) {
          expect(grandChild.parent).toBeUndefined;
          for (const greatChandChild of grandChild.children) {
            expect(greatChandChild.parent).toBeUndefined;
          }
        }
      }
    });
  });

  describe("AccountHierarchyNode#findItemWithId", () => {
    it("Recursively traverse tree depth first looking for an ID, and return that node (and its children) (depth 1)", () => {
      const mockACHN = getMockAccountHierarchy();
      const expectResultSerialized = JSON.stringify(mockACHN.children[1].serialize());

      const result = mockACHN.findItemWithId(mockACHN.children[1].id || "");

      expect(JSON.stringify(result)).toEqual(expectResultSerialized);
    });
    it("Recursively traverse tree depth first looking for an ID, and return that node (and its children) (depth 2)", () => {
      const mockACHN = getMockAccountHierarchy();
      const expectResultSerialized = JSON.stringify(mockACHN.children[1].children[0].serialize());

      const result = mockACHN.findItemWithId(mockACHN.children[1].children[0].id || "");

      expect(JSON.stringify(result)).toEqual(expectResultSerialized);
    });
    it("Recursively traverses tree depth first looking for an ID, and return that node (and its children) (depth 3)", () => {
      const mockACHN = getMockAccountHierarchy();
      const expectResultSerialized = JSON.stringify(mockACHN.children[1].children[0].children[0].serialize());

      const result = mockACHN.findItemWithId(mockACHN.children[1].children[0].children[0].id || "");

      expect(JSON.stringify(result)).toEqual(expectResultSerialized);
    });
    it("Recursively traverses tree depth first looking for an ID, and return that node (and its children) (alternate branch)", () => {
      const mockACHN = getMockAccountHierarchy();
      const expectResultSerialized = JSON.stringify(mockACHN.children[0].serialize());

      const result = mockACHN.findItemWithId(mockACHN.children[0].id || "");

      expect(JSON.stringify(result)).toEqual(expectResultSerialized);
    });

    it("Recursively traverses tree depth first looking for an ID, and return that node (and its children) (alternate branch depth 2)", () => {
      const mockACHN = getMockAccountHierarchy();
      const expectResultSerialized = JSON.stringify(mockACHN.children[0].children[1].serialize());

      const result = mockACHN.findItemWithId(mockACHN.children[0].children[1].id || "");

      expect(JSON.stringify(result)).toEqual(expectResultSerialized);
    });
  });

  describe("AccountHierarchyNode#getEthereumAccounts", () => {
    it("Recursively traverse depth first looking for ethereum accounts, and ultimately return an array of them", () => {
      const mockACHN = getMockAccountHierarchy();
      const expectedResults = [
        mockACHN.children[0].children[0].account,
        mockACHN.children[0].children[1].account,
        mockACHN.children[1].children[0].children[0].account,
      ];

      const results = mockACHN.getEthereumAccounts();
      expect(results).toEqual(expectedResults);
    });
  });
});
