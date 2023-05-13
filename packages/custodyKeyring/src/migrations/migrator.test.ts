import { AuthTypes } from "@metamask-institutional/types";
import { strict as assert } from "assert";
import fs from "fs";
import cloneDeep from "lodash.clonedeep";

import { migrations as liveMigrations } from ".";
import { CUSTODIAN_TYPES } from "..";
import { Migrator } from "./migrator";

const stubMigrations = [
  {
    version: 1,
    keyringTypesToChange: ["Custody - Test", "Custody - Jupiter"],
    migrate: state => {
      // clone the data just like we do in migrations
      const clonedData = cloneDeep(state);
      clonedData.meta = {
        version: 1,
      };
      return clonedData;
    },
  },
  {
    version: 2,
    keyringTypesToChange: ["Custody - Test", "Custody - Jupiter"],
    migrate: state => {
      const clonedData = cloneDeep(state);
      clonedData.meta = {
        version: 2,
      };
      return clonedData;
    },
  },
  {
    version: 3,
    keyringTypesToChange: ["Custody - Test", "Custody - Jupiter"],
    migrate: state => {
      const clonedData = cloneDeep(state);
      clonedData.meta = {
        version: 3,
      };
      return clonedData;
    },
  },
];
const versionedData = {
  type: "Custody - Test",
  authType: AuthTypes.TOKEN,
  meta: { version: 0 },
  jwt: "jwt0",
  accountsDetails: [{ jwt: "jwt0" }],
};

describe("migrations", function () {
  describe("liveMigrations require list", function () {
    let migrationNumbers;

    beforeAll(function () {
      const fileNames = fs.readdirSync("./src/migrations/");
      migrationNumbers = fileNames
        .reduce((acc: string[] = [], filename) => {
          const name = filename.split(".")[0];
          if (/^\d+$/u.test(name)) {
            acc.push(name);
          }
          return acc;
        }, [])
        .map(num => parseInt(num, 10));
    });

    it("should include all migrations", function () {
      migrationNumbers.forEach(num => {
        const migration = liveMigrations.find(m => m.version === num);
        assert(migration, `migration not included in 'migrations/index.js': ${num}`);
      });
    });

    it("should have tests for all migrations", function () {
      const fileNames = fs.readdirSync("./src/migrations/");
      const testNumbers = fileNames
        .reduce((acc: string[] = [], filename) => {
          const name = filename.split(".test.")[0];
          if (/^\d+$/u.test(name)) {
            acc.push(name);
          }
          return acc;
        }, [])
        .map(num => parseInt(num, 10));

      migrationNumbers.forEach(num => {
        if (num >= 33) {
          assert.ok(testNumbers.includes(num), `no test found for migration: ${num}`);
        }
      });
    });
  });

  describe("Migrator", function () {
    it("migratedData version should be version 3", async function () {
      const migrator = new Migrator({ migrations: stubMigrations });
      const migratedData = await migrator.migrateData(versionedData);
      assert.equal(migratedData.meta.version, stubMigrations[2].version);
    });

    it("should match the last version in live migrations", async function () {
      const migrator = new Migrator({ migrations: liveMigrations });
      const keyring = {
        type: "Custody - Jupiter",
        custodianType: CUSTODIAN_TYPES.JUPITER,
        authType: AuthTypes.TOKEN,
        accountsDetails: [
          {
            jwt: "jwt1",
          } as any,
        ],
      };

      const migratedKeyring = migrator.migrateData(keyring);
      // console.log('migratedKeyring: ', migratedKeyring);
      const last = liveMigrations.length - 1;
      assert.equal(migratedKeyring.meta.version, liveMigrations[last].version);
    });
  });
});
