import { AuthTypes } from "@metamask-institutional/types";

import { CUSTODIAN_TYPES } from "..";
import migration1 from "./001";

describe("migration #1", function () {
  it("should add authDetails to keyrings accountDetails", function (done) {
    const data = {
      custodianType: CUSTODIAN_TYPES.JSONRPC,
      type: "Custody - Curv",
      authType: AuthTypes.TOKEN,
      meta: { version: 0 },
      jwt: "jwt1",
      accountsDetails: [{ jwt: "jwt1" }],
    };
    const migratedData = migration1.migrate(data);
    expect(migratedData.accountsDetails[0].authDetails.jwt).toBe("jwt1");
    done();
  });

  it("should add the default API URL", function (done) {
    const data = {
      custodianType: CUSTODIAN_TYPES.JSONRPC,
      type: "Custody - Curv",
      authType: AuthTypes.TOKEN,
      meta: { version: 0 },
      jwt: "jwt1",
      accountsDetails: [{ jwt: "jwt1" }],
    };
    const migratedData = migration1.migrate(data);
    expect(migratedData.accountsDetails[0].apiUrl).toBe(data.custodianType.apiUrl);
    done();
  });
});
