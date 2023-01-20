import { IEthereumAccountCustodianDetails } from "../../../interfaces/IEthereumAccountCustodianDetails";

export interface ICactusEthereumAccountCustodianDetails extends IEthereumAccountCustodianDetails {
  walletId: string;
  chainId?: number;
}
