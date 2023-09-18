/**
 * @typedef {Object} MMIPortfolioOptions
 * @property {Object} initState The initial controller state
 */
import { ConfigurationClient } from "@metamask-institutional/configuration-client";
import { ObservableStore } from "@metamask/obs-store";

import { CUSTODIAN_TYPES } from "./custodianTypes";
import { IConfiguration } from "./interfaces/IConfiguration";
import { IJsonRpcCustodian } from "./interfaces/IJsonRpcCustodian";
import { IMmiConfigurationControllerOptions } from "./interfaces/IMmiConfigurationControllerOptions";
import { MMIConfiguration } from "./types/MMIConfiguration";

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

    // Mutate custodians by adding information from the hardcoded types
    const custodians = [
      ...Object.values(CUSTODIAN_TYPES)
        .filter(custodian => custodian.hidden === false)
        .map(custodian => ({
          type: custodian.name,
          name: custodian.name.toLowerCase(),
          website: custodian.website,
          envName: custodian.envName,
          apiUrl: custodian.apiUrl,
          iconUrl: custodian.imgSrc,
          displayName: custodian.displayName,
          websocketApiUrl: null, // Legacy custodian
          production: custodian.production,
          refreshTokenUrl: null,
          isNoteToTraderSupported: false,
          version: 1,
        })),
    ];

    // Loop through the custodians from the API
    configuredCustodians.forEach(custodian => {
      custodian.environments.forEach(environment => {
        if (!environment.apiBaseUrl) {
          // Version 1 custodians should still support note to trader
          // Find the legacy custodians in the list of custodians we are building
          const legacyCustodian = custodians.find(
            legacyCustodian => legacyCustodian.name.toLowerCase() === environment.name,
          );
          if (!legacyCustodian) {
            console.warn(`Missing legacy custodian ${environment.name}`);
          } else {
            legacyCustodian.isNoteToTraderSupported = environment.isNoteToTraderSupported;
          }
          return; // Use return instead of continue
        }

        custodians.push({
          type: "JSONRPC",
          iconUrl: custodian.iconUrl,
          name: custodian.name,
          website: custodian.website,
          envName: environment.name,
          apiUrl: environment.apiBaseUrl,
          displayName: environment.displayName,
          production: environment.enabled,
          refreshTokenUrl: environment.refreshTokenUrl,
          websocketApiUrl: environment.websocketApiUrl,
          isNoteToTraderSupported: environment.isNoteToTraderSupported,
          version: 2,
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
