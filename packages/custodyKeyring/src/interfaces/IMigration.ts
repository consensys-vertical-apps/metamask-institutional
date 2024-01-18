export interface IMigration {
  version: number; // The migration version
  keyringTypesToChange?: string[];
  migrate(versionedDate: any): any; // Returns a promise of the migrated data
}
