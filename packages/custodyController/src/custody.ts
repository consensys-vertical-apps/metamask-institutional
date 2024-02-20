import { CUSTODIAN_TYPES } from "@metamask-institutional/custody-keyring";
import { ITransactionStatusMap } from "@metamask-institutional/types";
import { ObservableStore } from "@metamask/obs-store";

import { CustodyAccountDetails } from "./types";
import { toChecksumHexAddress } from "./utils";

/**
 * @typedef {Object} CustodyOptions
 * @property {Object} initState The initial controller state
 */

/**
 * Background controller responsible for maintaining
 * a cache of custody data in local storage
 */
export class CustodyController {
  public store;

  public captureException: (e: Error) => void;
  /**
   * Creates a new controller instance
   *
   * @param {CustodyOptions} [opts] - Controller configuration parameters
   */
  constructor(opts: any = {}) {
    const { initState, captureException } = opts;

    this.store = new ObservableStore({
      custodyAccountDetails: {} as { [key: string]: CustodyAccountDetails },
      custodianConnectRequest: {},
      ...initState,
    });

    this.captureException = captureException;
  }

  storeCustodyStatusMap(custody: string, custodyStatusMap: ITransactionStatusMap): void {
    try {
      const { custodyStatusMaps } = this.store.getState();

      this.store.updateState({
        custodyStatusMaps: {
          ...custodyStatusMaps,
          [custody.toLowerCase()]: custodyStatusMap,
        },
      });
    } catch (error) {
      this.captureException(error);
    }
  }

  storeSupportedChainsForAddress(address: string, supportedChains: string[], custodianName: string): void {
    try {
      const { custodianSupportedChains } = this.store.getState();

      this.store.updateState({
        custodianSupportedChains: {
          ...custodianSupportedChains,
          [address]: {
            supportedChains: supportedChains.map(chain => Number(chain).toString()),
            custodianName: custodianName,
          },
        },
      });
    } catch (error) {
      this.captureException(error);
    }
  }

  setAccountDetails(newAccountDetails: CustodyAccountDetails[]): void {
    try {
      const { custodyAccountDetails } = this.store.getState();
      const accountsToAdd = {};
      newAccountDetails.forEach(item => {
        if (!custodyAccountDetails[toChecksumHexAddress(item.address)]) {
          accountsToAdd[toChecksumHexAddress(item.address)] = item;
        }
      });
      this.store.updateState({
        custodyAccountDetails: {
          ...custodyAccountDetails,
          ...accountsToAdd,
        },
      });
    } catch (error) {
      this.captureException(error);
    }
  }

  removeAccount(address: string): void {
    try {
      const { custodyAccountDetails } = this.store.getState();
      delete custodyAccountDetails[toChecksumHexAddress(address)];
      this.store.updateState({ custodyAccountDetails });
    } catch (error) {
      this.captureException(error);
    }
  }

  setWaitForConfirmDeepLinkDialog(waitForConfirmDeepLinkDialog: boolean): void {
    this.store.updateState({
      waitForConfirmDeepLinkDialog,
    });
  }

  getAccountDetails(address: string): CustodyAccountDetails {
    const { custodyAccountDetails } = this.store.getState();
    return custodyAccountDetails[toChecksumHexAddress(address)];
  }

  getCustodyTypeByAddress(address: string): string {
    const { custodyAccountDetails } = this.store.getState();
    return custodyAccountDetails[address]?.custodyType;
  }

  getAllCustodyTypes(): Set<string | unknown> {
    try {
      const custodyTypes = new Set();
      const { custodyAccountDetails } = this.store.getState();

      for (const address of Object.keys(custodyAccountDetails)) {
        custodyTypes.add(custodyAccountDetails[address]?.custodyType);
      }
      return custodyTypes;
    } catch (error) {
      this.captureException(error);
    }
  }

  handleMmiCustodianInUse(req: {
    origin: string;
    params: {
      custodianName: string;
    };
  }): boolean {
    try {
      if (!req.params.custodianName) {
        throw new Error("Missing parameter: custodianName");
      }

      const custodian = CUSTODIAN_TYPES[req.params.custodianName.toUpperCase()];

      let allowed = false;

      if (custodian) {
        for (const origin of custodian.origins) {
          if (origin.test(req.origin)) {
            allowed = true;
          }
        }
      }

      if (!allowed) {
        throw new Error("Forbidden");
      }

      const { custodyAccountDetails } = this.store.getState();

      for (const address of Object.keys(custodyAccountDetails)) {
        if (custodyAccountDetails[address]?.custodyType === `Custody - ${custodian.name}`) {
          return true;
        }
      }

      return false;
    } catch (error) {
      this.captureException(error);
      throw error;
    }
  }

  async handleMmiCheckIfTokenIsPresent({
    token,
    envName,
    keyring,
  }: {
    token: string;
    envName: string;
    keyring: any;
  }): Promise<boolean> {
    try {
      const accounts = await keyring.getAccounts();

      for (const address of accounts) {
        const accountDetails = keyring.getAccountDetails(address);

        if (accountDetails.envName === envName && accountDetails.authDetails.refreshToken === token) {
          return true;
        }
      }

      return false;
    } catch (error) {
      this.captureException(error);
      return false;
    }
  }
}
