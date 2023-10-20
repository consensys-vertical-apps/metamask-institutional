import { AuthTypes } from "@metamask-institutional/types";

import { MMISDK } from "../classes/MMISDK";
import { DEFAULT_MAX_CACHE_AGE } from "../constants/constants";
import { ECA3CustodianApi } from "../custodianApi/eca3/ECA3CustodianApi";
import { mmiSDKFactory } from "./mmi-sdk-factory";

jest.mock("../custodianApi/eca3/ECA3CustodianApi");

jest.mock("../classes/MMISDK");

describe("MMI SDK Factory", () => {
  it("should call the constructor of MMI SDK with a specific custodian API constructor", () => {
    mmiSDKFactory(ECA3CustodianApi, { jwt: "xxx" }, AuthTypes.TOKEN, "https://test");

    expect(MMISDK).toHaveBeenCalledWith(
      ECA3CustodianApi,
      { jwt: "xxx" },
      AuthTypes.TOKEN,
      "https://test",
      DEFAULT_MAX_CACHE_AGE,
    );
  });

  it("should throw if the url is a http url", () => {
    const t = () => {
      mmiSDKFactory(ECA3CustodianApi, { jwt: "xxx" }, AuthTypes.TOKEN, "http://test");
    };

    expect(t).toThrowError("http:// URLs are not supported - only https://");
  });

  it("unless the URL is a localhost URL", () => {
    mmiSDKFactory(ECA3CustodianApi, { jwt: "xxx" }, AuthTypes.TOKEN, "http://localhost");

    expect(MMISDK).toHaveBeenCalledWith(
      ECA3CustodianApi,
      { jwt: "xxx" },
      AuthTypes.TOKEN,
      "https://test",
      DEFAULT_MAX_CACHE_AGE,
    );
  });
});
