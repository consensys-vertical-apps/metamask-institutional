export interface ExtensionDashboardResponseAccount {
  address: string;
  name: string;
  custodyType: string;
}

export interface ExtensionDashboardResponse {
  accounts: ExtensionDashboardResponseAccount[];
  networks: number[];
}
