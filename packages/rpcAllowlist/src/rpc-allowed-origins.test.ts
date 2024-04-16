import { isAllowedRPCOrigin } from "./rpc-allowed-origins";

describe("isAllowedRPCOrigin", () => {
  ["metamaskinstitutional_portfolio", "metamaskinstitutional_open_swaps"].forEach(messageType => {
    describe(`when the message type is ${messageType}`, () => {
      it("returns true for valid local origins", () => {
        expect(isAllowedRPCOrigin(messageType, "http://localhost:3001")).toBe(true);
        expect(isAllowedRPCOrigin(messageType, "http://host.docker.internal:3001")).toBe(true);
      });

      it("returns true for valid MMI subdomains", () => {
        expect(isAllowedRPCOrigin(messageType, "https://subdomain.metamask-institutional.io")).toBe(true);
      });

      it("returns false for invalid MMI subdomains", () => {
        expect(isAllowedRPCOrigin(messageType, "https://subdomain.notmetamask-institutional.io")).toBe(false);
      });

      it("returns false for urls that are not allowed", () => {
        expect(isAllowedRPCOrigin(messageType, "https://anything.com/.metamask-institutional.io")).toBe(false);
      });

      it("returns false for valid MMI subdomains not using https", () => {
        expect(isAllowedRPCOrigin(messageType, "http://subdomain.metamask-institutional.io")).toBe(false);
      });

      it("returns true for root MMI domain", () => {
        expect(isAllowedRPCOrigin(messageType, "https://metamask-institutional.io")).toBe(true);
      });
    });
  });
});
