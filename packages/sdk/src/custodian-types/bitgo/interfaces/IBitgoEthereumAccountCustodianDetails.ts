import { IEthereumAccountCustodianDetails } from "../../../interfaces/IEthereumAccountCustodianDetails";

export interface IBitgoEthereumAccountCustodianDetails
  extends IEthereumAccountCustodianDetails {
  accountId: string;
  coinId: string;
}
