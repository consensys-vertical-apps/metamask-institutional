import { IEthereumAccountCustodianDetails } from "@metamask-institutional/sdk";

export interface CustodyAccountDetails {
  address: string;
  name: string;
  custodianDetails: IEthereumAccountCustodianDetails;
  labels: string[];
  apiUrl: string;
  custodyType: string;
  chainId: number;
  custodianName: string; // e.g. saturn-dev - this will be used to look up custodian details from the MMI configuration store
}
