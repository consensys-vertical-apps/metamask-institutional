import { AuthTypes } from "@metamask-institutional/types";
import { mmiSDKFactory } from "./mmi-sdk-factory";
import { JupiterCustodianApi } from "../custodian-types/jupiter/JupiterCustodianApi";
import { MMISDK } from "../classes/MMISDK";
import { DEFAULT_MAX_CACHE_AGE } from "../constants/constants";

jest.mock("../custodian-types/jupiter/JupiterCustodianApi");

jest.mock("../classes/MMISDK");

describe("MMI SDK Factory", () => {
  it("should call the constructor of MMI SDK with a specific custodian API constructor", () => {
    mmiSDKFactory(
      JupiterCustodianApi,
      { jwt: "xxx" },
      AuthTypes.TOKEN,
      "https://test"
    );

    expect(MMISDK).toHaveBeenCalledWith(
      JupiterCustodianApi,
      { jwt: "xxx" },
      AuthTypes.TOKEN,
      "https://test",
      DEFAULT_MAX_CACHE_AGE
    );
  });

  it("should throw if the url is a http url", () => {
    const t = () => {
      mmiSDKFactory(
        JupiterCustodianApi,
        { jwt: "xxx" },
        AuthTypes.TOKEN,
        "http://test"
      );
    };

    expect(t).toThrowError("http:// URLs are not supported - only https://");
  });

  it("unless the URL is a localhost URL", () => {
    mmiSDKFactory(
      JupiterCustodianApi,
      { jwt: "xxx" },
      AuthTypes.TOKEN,
      "http://localhost"
    );

    expect(MMISDK).toHaveBeenCalledWith(
      JupiterCustodianApi,
      { jwt: "xxx" },
      AuthTypes.TOKEN,
      "https://test",
      DEFAULT_MAX_CACHE_AGE
    );
  });
});
