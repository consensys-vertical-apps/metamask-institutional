import { MMISDK, mmiSDKFactory } from "@metamask-institutional/sdk";
import { IExtensionCustodianAccount, IRefreshTokenAuthDetails } from "@metamask-institutional/types";
import crypto, { Hash } from "crypto";
import { MmiConfigurationController } from "src/MmiConfiguration";
import { mocked } from "ts-jest/utils";

import { QredoCustodyKeyring } from "./QredoCustodyKeyring";
import { QredoStatusMap } from "./QredoStatusMap";

jest.mock("@metamask-institutional/sdk");

const mockedMmiSdkFactory = mocked(mmiSDKFactory, true);

const mockMMISDK = {
  getAccountHierarchy: jest.fn(),
  getEthereumAccounts: jest.fn().mockResolvedValue([
    {
      name: "myCoolAccount",
      address: "0x123456",
      custodianDetails: {},
      labels: [{ key: "my-label", value: "my-label" }],
      jwt: "jwt",
      apiUrl: "https://qredo-api.com",
      envName: "qredo",
    },
  ]),
  getEthereumAccountsByAddress: jest.fn().mockResolvedValue([]),
  getEthereumAccountsByLabelOrAddressName: jest.fn().mockResolvedValue([]),
  createTransaction: jest.fn(),
  getTransaction: jest.fn(),
  getAllTransactions: jest.fn(),
  getCustomerId: jest.fn(),
  signedTypedData_v4: jest.fn(),
  getErc20Tokens: jest.fn(),
  subscribeToEvents: jest.fn(),
  registerEventCallback: jest.fn(),
  handlePing: jest.fn(),
  checkPing: jest.fn(),
  handleEvent: jest.fn(),
  getTransactionLink: jest.fn().mockResolvedValue(null),
  on: jest.fn(),
  eventCallbacks: [],
  jwt: "",
  defaultCacheAgeSeconds: 0,
  lastPing: 0,
  pingCheckRunning: false,
  cache: null,
  custodianApi: null,
};

describe("QredoCustodyKeyring", () => {
  let custodyKeyring: QredoCustodyKeyring;

  beforeEach(() => {
    custodyKeyring = new QredoCustodyKeyring({
      mmiConfigurationController: {
        store: {
          getState: jest.fn().mockReturnValue({
            mmiConfiguration: {
              custodians: [
                {
                  apiUrl: "https://qredo-api.com",
                  envName: "qredo",
                },
              ],
            },
          }),
        },
      } as unknown as MmiConfigurationController,
    });
    jest.clearAllMocks();
    mockedMmiSdkFactory.mockReturnValue(mockMMISDK as unknown as MMISDK);
  });

  describe("getTransactionDeepLink", () => {
    it("should resolve to null", async () => {
      const mockSelectedAddresses: IExtensionCustodianAccount[] = [
        {
          name: "myCoolAccount1",
          address: "0x123456",
          custodianDetails: { wallet_id: "test" },
          labels: [{ key: "my-label", value: "my-label" }],
          token: "jwt",
          apiUrl: "https://qredo-api.com",
          chainId: 4,
          custodyType: "Qredo",
          envName: "qredo",
        },
      ];

      custodyKeyring.setSelectedAddresses(mockSelectedAddresses);
      custodyKeyring.addAccounts(1);

      const result = await custodyKeyring.getTransactionDeepLink("0x123456", "12345");

      expect(result).toEqual(null);
    });
  });

  describe("getStatusMap", () => {
    it("should return the status map", () => {
      expect(custodyKeyring.getStatusMap()).toEqual(QredoStatusMap);
    });
  });

  // This method is tested in the Jupiter Keyring test, but that has a different AuthType
  describe("hashAuthDetails", () => {
    it("should hash the refreshtoken together with the custodian API URL", () => {
      const authDetails: IRefreshTokenAuthDetails = {
        refreshToken: "miaow",
      };

      const url = "https://qredo-api.com";
      const envName = "qredo";

      const hashMock = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValueOnce("fake hash"),
      } as unknown as Hash;

      // Mocking the crypto module
      const createHashMock = jest.spyOn(crypto, "createHash").mockImplementationOnce(() => hashMock);

      const result = custodyKeyring.hashAuthDetails(authDetails, envName);

      expect(createHashMock).toBeCalledWith("sha256");
      expect(hashMock.update).toBeCalledWith(authDetails.refreshToken + url);
      expect(hashMock.digest).toBeCalledWith("hex");

      expect(result).toEqual("fake hash");
    });
  });

  describe("createAuthDetails", () => {
    it("should take a token and turn it into IRefreshTokenAuthDetails", () => {
      const refreshToken = "token";

      const result = custodyKeyring.createAuthDetails(refreshToken);

      expect(result).toEqual({
        refreshToken,
      });
    });
  });
});
