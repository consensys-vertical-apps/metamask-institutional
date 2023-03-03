import { toChecksumAddress } from "@ethereumjs/util";
import { CustodyAccountDetails } from "@metamask-institutional/custody-controller";
import { IJsonRpcCustodian } from "@metamask-institutional/custody-keyring";
import { ITransactionStatusMap } from "@metamask-institutional/types";

export function getWaitForConfirmDeepLinkDialog(state): boolean {
  return state.metamask.waitForConfirmDeepLinkDialog;
}

export function getTransactionStatusMap(state): ITransactionStatusMap {
  return state.metamask.custodyStatusMaps;
}

export function getCustodyAccountDetails(state): { [key: string]: CustodyAccountDetails } {
  return state.metamask.custodyAccountDetails;
}

export function getCustodyAccountSupportedChains(state, address) {
  return state.metamask.custodianSupportedChains
    ? state.metamask.custodianSupportedChains[toChecksumAddress(address)]
    : [];
}

export function getMmiPortfolioEnabled(state): boolean {
  return state.metamask.mmiConfiguration?.portfolio?.enabled;
}

export function getMmiPortfolioUrl(state): string {
  return state.metamask.mmiConfiguration?.portfolio?.url;
}

export function getConfiguredCustodians(state): IJsonRpcCustodian[] {
  return state.metamask.mmiConfiguration?.custodians || [];
}

export function getCustodianIconForAddress(state, address: string): string {
  let custodianIcon;

  const checksummedAddress = toChecksumAddress(address);
  if (state.metamask.custodyAccountDetails?.[checksummedAddress]) {
    const { custodianName } = state.metamask.custodyAccountDetails[checksummedAddress];
    custodianIcon = state.metamask.mmiConfiguration?.custodians?.find(
      custodian => custodian.name === custodianName,
    )?.iconUrl;
  }

  return custodianIcon;
}
