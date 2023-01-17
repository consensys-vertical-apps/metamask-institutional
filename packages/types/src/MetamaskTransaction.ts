import { IEIP1559TxParams, ILegacyTXParams } from "./ITXParams";

// This seems to be equivalent to
// TransactionMeta
// in shared/constants/transaction.js (mmi-extension)
// But it has a few extra properties that are there in practise, e.g. chainId

export type MetamaskTransaction = {
  chainId: string;
  custodyStatus: string;
  dappSuggestedGasFees: {
    gas: string;
  };
  estimatedBaseFee: string;
  history: MetamaskTransaction[];
  id: number;
  loadingDefaults: boolean;
  metamaskNetworkId: string;
  origin: string;
  status: string;
  custodyStatusDisplayText: string;
  time: string;
  txParams: ILegacyTXParams | IEIP1559TxParams;
  type: string;
  userFeeLevel: string;
  hash: string;
  metadata?: {
    note?: string;
  };
};
