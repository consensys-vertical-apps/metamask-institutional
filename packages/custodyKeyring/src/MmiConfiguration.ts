/**
 * @typedef {Object} MMIPortfolioOptions
 * @property {Object} initState The initial controller state
 */
import { ConfigurationClient } from "@metamask-institutional/configuration-client";
import { ObservableStore } from "@metamask/obs-store";

import { CUSTODIAN_TYPES } from "./custodianTypes";
import { IConfiguration } from "./interfaces/IConfiguration";
import { ICustodianEnvironment } from "./interfaces/ICustodianEnvironment";
import { IMmiConfigurationControllerOptions } from "./interfaces/IMmiConfigurationControllerOptions";
import { MMIConfiguration } from "./types/MMIConfiguration";

// If a custodian is `curv`, `qredo` `bitgo` or `cactus` it is legacy custodian
const legacyCustodianNames = ["curv", "qredo", "bitgo", "cactus"];

/**
 * Background controller responsible for maintaining
 * a cache of MMI Portfolio related data in local storage
 */
export class MmiConfigurationController {
  public store;
  public configurationClient;

  /**
   * Creates a new controller instance
   *
   * @param {MmiPortfolioOptions} [opts] - Controller configuration parameters
   */
  constructor(opts: IMmiConfigurationControllerOptions = {}) {
    console.log("MMI Configuration controller constructor");
    const initState = opts.initState?.mmiConfiguration
      ? opts.initState
      : {
          mmiConfiguration: {
            portfolio: {
              enabled: false,
              url: "",
              cookieSetUrls: [],
            },
            features: {
              websocketApi: false,
            },
            custodians: [], // NB: Custodians will always be empty when we start
          },
        };

    this.configurationClient = new ConfigurationClient(opts.mmiConfigurationServiceUrl);

    this.store = new ObservableStore<MMIConfiguration>({
      mmiConfiguration: {
        portfolio: {
          ...initState.mmiConfiguration.portfolio,
        },
        features: {
          ...initState.mmiConfiguration.features,
        },
        custodians: initState.mmiConfiguration.custodians,
      },
    });
  }

  async storeConfiguration(): Promise<void> {
    const configuration: IConfiguration = await this.getConfiguration(); // Live configuration from API
    const { portfolio, features } = configuration;

    const { mmiConfiguration } = this.store.getState(); // Stored configuration
    const configuredCustodians = configuration.custodians;

    // Steo 1: populate the custodian array with the LEGACY custodians
    // Mutate custodians by adding information from the hardcoded types
    const custodians: ICustodianEnvironment[] = [
      ...Object.values(CUSTODIAN_TYPES)
        .filter(custodian => custodian.hidden === false)
        .map(custodian => ({
          type: custodian.name,
          name: custodian.name.toLowerCase(),
          onboardingUrl: custodian.onboardingUrl,
          website: custodian.website,
          envName: custodian.envName,
          apiUrl: custodian.apiUrl,
          apiVersion: custodian.apiVersion,
          iconUrl: custodian.imgSrc,
          displayName: custodian.displayName,
          websocketApiUrl: null, // Legacy custodian
          production: custodian.production,
          refreshTokenUrl: null,
          isNoteToTraderSupported: false,
          isQRCodeSupported: false,
          isManualTokenInputSupported: false,
          custodianPublishesTransaction: custodian.custodianPublishesTransaction,
          version: 1,
        })),
    ];

    // Step 2: populate the custodians array with the configured custodians, which already INCLUDES the legacy custodians
    // We also mutate the legacy custodian, adding the API url when it exists on the configured custodians side (Bitgo dev/test env)

    // Loop through the custodians from the API
    configuredCustodians.forEach(custodian => {
      custodian.environments.forEach(environment => {
        if (environment.name.includes("bitgo")) {
          environment.type = "Bitgo";
          environment.version = 1;
          environment.apiVersion = undefined;
          environment.websocketApiUrl = undefined;
        }

        // This used to check if there is no apiUrl, but now it checks by name
        if (legacyCustodianNames.includes(environment.name)) {
          // This logic checks if something is a legacy custodian

          // Find the legacy custodians in the list of custodians we are building
          const legacyCustodian = custodians.find(
            legacyCustodian => legacyCustodian.name.toLowerCase() === environment.name,
          );
          if (!legacyCustodian) {
            console.warn(`Missing legacy custodian ${environment.name}`);
          } else {
            if (environment.apiBaseUrl) {
              // Updates a legacy custodian with an API url from the configured custodian,
              // it's useful for bitgo that has a different API url from dev to prod
              legacyCustodian.apiUrl = environment.apiBaseUrl;
            }
          }
          return; // Exit this routine to avoid double adding the legacy custodian
        }

        custodians.push({
          type: environment.apiVersion === "3" ? "ECA3" : environment.apiVersion === "1" ? "JSONRPC" : environment.type,
          iconUrl: custodian.iconUrl,
          name: custodian.name,
          onboardingUrl: custodian.onboardingUrl,
          website: custodian.website,
          envName: environment.name,
          apiUrl: environment.apiBaseUrl,
          apiVersion: environment.apiVersion,
          displayName: environment.displayName,
          production: environment.enabled,
          refreshTokenUrl: environment.refreshTokenUrl,
          websocketApiUrl: environment.websocketApiUrl,
          isNoteToTraderSupported: environment.isNoteToTraderSupported,
          isQRCodeSupported: environment.isQRCodeSupported,
          isManualTokenInputSupported: environment.isManualTokenInputSupported,
          custodianPublishesTransaction: environment.custodianPublishesTransaction,
          version: !environment.apiVersion ? 1 : 2,
        });
      });
    });

    this.store.updateState({
      mmiConfiguration: {
        ...mmiConfiguration,
        portfolio: {
          ...mmiConfiguration.portfolio,
          enabled: portfolio.enabled,
          url: portfolio.url,
          cookieSetUrls: portfolio.cookieSetUrls,
        },
        features: {
          websocketApi: features.websocketApi,
        },
        custodians,
      },
    });
  }

  getConfiguration(): Promise<IConfiguration> {
    return this.configurationClient.getConfiguration();
  }

  getWebsocketApiUrl(): string {
    // Websocket API URL is stored per custodian, but we open only one connection at the moment
    // Therefore we return the first custodian that has a websocket API URL
    const { mmiConfiguration } = this.store.getState();

    console.log("mmiConfiguration", mmiConfiguration);

    const custodian = mmiConfiguration.custodians.find(custodian => custodian.websocketApiUrl);

    return custodian?.websocketApiUrl;
  }
}
