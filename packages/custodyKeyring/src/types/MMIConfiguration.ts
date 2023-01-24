import { IJsonRpcCustodian } from "../interfaces/IJsonRpcCustodian";

export type MMIConfiguration = {
  mmiConfiguration: {
    portfolio: {
      enabled: boolean;
      url: string;
    };
    features: {
      websocketApi: boolean;
    };
    custodians: IJsonRpcCustodian[];
  };
};
