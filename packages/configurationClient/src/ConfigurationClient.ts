import { IJsonRpcCustodian } from "@metamask-institutional/custody-keyring";

import { MMI_CONFIGURATION_API_URL } from "./constants";
import { IConfiguration } from "./types";

export class ConfigurationClient {
  constructor(public configurationApiUrl: string = MMI_CONFIGURATION_API_URL) {}

  async getConfiguration(): Promise<IConfiguration> {
    console.log(`Fetching MMI configuration from ${this.configurationApiUrl}`);

    try {
      const response = await fetch(this.configurationApiUrl, { method: "GET" });

      const configData = await response.json();
      return configData as IConfiguration;
    } catch (e) {
      console.log(`Error fetching MMI configuration`);
      throw new Error(e);
    }
  }

  async getCustodianConfigurationForApiUrl(apiUrl: string): Promise<Partial<IJsonRpcCustodian>> {
    const { custodians } = await this.getConfiguration();

    const custodian = custodians.find(c => c.apiBaseUrl === apiUrl);

    if (!custodian) {
      throw new Error(`Could not find custodian with URL: ${apiUrl} - please contact support`);
    }

    return {
      refreshTokenUrl: custodian.refreshTokenUrl,
      websocketApiUrl: custodian.websocketApiUrl,
    };
  }
}
