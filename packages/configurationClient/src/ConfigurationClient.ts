import { MMI_CONFIGURATION_API_URL } from "./constants";
import { IConfiguration, IJsonRpcCustodian } from "./types";

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
}
