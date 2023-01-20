/**
 * Factory for MMI SDK to make testing easier
 */

import { MMISDK } from "../classes/MMISDK";
import { DEFAULT_MAX_CACHE_AGE } from "../constants/constants";
import { AuthTypes, AuthDetails } from "@metamask-institutional/types";
import { CustodianApiConstructor } from "../interfaces/ICustodianApi";

export const mmiSDKFactory = function (
  custodianApi: CustodianApiConstructor,
  authDetails: AuthDetails,
  authType: AuthTypes,
  apiUrl: string
): MMISDK {
  // Do not support HTTP URLs, except in the case of curv, and then, only if they are localhost OR the cactus
  // test environment

  if (
    apiUrl.startsWith("http://") &&
    !apiUrl.startsWith("http://localhost") &&
    !apiUrl.startsWith("http://18.139.217.63")
  ) {
    throw new Error("http:// URLs are not supported - only https://");
  }

  return new MMISDK(
    custodianApi,
    authDetails,
    authType,
    apiUrl,
    DEFAULT_MAX_CACHE_AGE
  );
};
