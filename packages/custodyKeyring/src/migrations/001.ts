import { AuthTypes } from "@metamask-institutional/types";
import cloneDeep from "lodash.clonedeep";

import { CustodyKeyring } from "../CustodyKeyring";

const version = 1;
const keyringTypesToChange = []; // Do not actually change any keyrings - 21 Aug 2023 - we only keep this old migration file around as an example

export default {
  version,
  keyringTypesToChange,
  migrate(keyring) {
    let versionedKeyring: any = {};
    if (keyringTypesToChange.includes(keyring.type)) {
      versionedKeyring = cloneDeep(keyring);
      if (versionedKeyring.meta?.version !== version) {
        versionedKeyring.meta = {
          version,
        };
        const newKeyring = transformKeyring(versionedKeyring);
        versionedKeyring = newKeyring;
      }
    }
    return versionedKeyring || keyring;
  },
};

function transformKeyring(keyring: any) {
  delete keyring.jwt;
  delete keyring.token;

  const defaultApiUrl = (keyring as CustodyKeyring).custodianType.apiUrl;

  keyring.accountsDetails = keyring.accountsDetails.map(details => ({
    name: details.name,
    address: details.address,
    custodianDetails: details.custodianDetails,
    labels: details.labels,
    apiUrl: details.apiUrl || defaultApiUrl,
    chainId: details.chainId,
    custodyType: details.custodyType,
    authDetails:
      keyring.authType === AuthTypes.REFRESH_TOKEN
        ? {
            refreshToken: details.jwt || details.token || details.authDetails?.refreshToken,
          }
        : { jwt: details.jwt || details.token || details.authDetails?.jwt },
  }));
  return keyring;
}
