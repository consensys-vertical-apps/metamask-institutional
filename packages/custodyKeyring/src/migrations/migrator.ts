import { EventEmitter } from "events";

import { IMigration } from "../interfaces/IMigration";
import { IMigratorOptions } from "../interfaces/IMigratorOptions";

export class Migrator extends EventEmitter {
  public migrations: IMigration[];
  public defaultVersion: number;

  constructor(opts: IMigratorOptions) {
    super();
    const migrations = opts?.migrations || [];
    // sort migrations by version
    this.migrations = migrations.sort((a, b) => a.version - b.version);
    // grab migration with highest version
    const lastMigration = this.migrations.slice(-1)[0];
    // use specified defaultVersion or highest migration version
    this.defaultVersion = opts.defaultVersion || (lastMigration && lastMigration.version) || 0;
  }

  // run all pending migrations on meta in place
  migrateData(versionedKeyring = this.generateInitialState()) {
    const migrationIsPending = migration =>
      migration.keyringTypesToChange.includes(versionedKeyring.type) &&
      (!versionedKeyring.meta || versionedKeyring.meta.version < migration.version);
    // get all migrations that have not yet been run
    const pendingMigrations = this.migrations.filter(migrationIsPending);

    // perform each migration
    for (const migration of pendingMigrations) {
      try {
        // attempt migration and validate
        const migratedKeyring = migration.migrate(versionedKeyring);
        if (!migratedKeyring.meta) {
          throw new Error("MMI Migrator - migration returned empty meta");
        }
        if (migratedKeyring.meta.version !== migration.version) {
          throw new Error("MMI Migrator - Migration did not update version number correctly");
        }
        // accept the migration as good
        // eslint-disable-next-line no-param-reassign
        versionedKeyring = migratedKeyring;
      } catch (err) {
        // rewrite error message to add context without clobbering stack
        const originalErrorMessage = err.message;
        err.message = `MetaMask Institutional Migration Error #${migration.version}: ${originalErrorMessage}`;
        // emit error instead of throw so as to not break the run (gracefully fail)
        this.emit("error", err);
        // stop migrating and use state as is
        return versionedKeyring;
      }
    }

    return versionedKeyring;
  }

  /**
   * Returns the initial state for the migrator
   * @param {Object} [data] - The data for the initial state
   * @returns {{meta: {version: number}, data: any}}
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  generateInitialState(data?: any): any {
    return {
      meta: {
        version: this.defaultVersion,
      },
      data,
    };
  }
}
