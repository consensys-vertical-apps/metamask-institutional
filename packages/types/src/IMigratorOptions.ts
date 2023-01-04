import { IMigration } from "./IMigration";

export interface IMigratorOptions {
  migrations: Array<IMigration>; // The list of migrations to apply
  defaultVersion?: number; // The version to use in the initial state
}
