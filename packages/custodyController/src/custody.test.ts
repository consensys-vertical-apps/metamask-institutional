import { ITransactionStatus } from "@metamask-institutional/types";

import { CustodyController } from "./custody";
import { CustodyAccountDetails } from "./types";

describe("CustodyController", function () {
  const INIT_STATE = {
    custodyAccountDetails: {},
    custodyStatusMaps: {},
    waitForConfirmDeepLinkDialog: false,
  };

  const createController = async initState => new CustodyController({ initState, captureException: jest.fn() });

  it("should create custodyController", async function () {
    const controller = await createController(INIT_STATE);
    expect(controller).toBeTruthy();
  });

  it("should set custodyStatusMap", async function () {
    const controller = await createController(INIT_STATE);
    controller.storeCustodyStatusMap("custody", {
      status: { mmStatus: "status" } as ITransactionStatus,
    });
    const state = controller.store.getState();
    expect(state.custodyStatusMaps.custody.status.mmStatus).toBe("status");
  });

  it("should set custodianSupportedChains", async function () {
    const controller = await createController(INIT_STATE);
    controller.storeSupportedChainsForAddress("0x", ["1", "2"], "jupiter");
    const state = controller.store.getState();
    expect(state.custodianSupportedChains).toEqual({
      "0x": {
        supportedChains: ["1", "2"],
        custodianName: "jupiter",
      },
    });
  });

  it("should set account details", async function () {
    const controller = await createController(INIT_STATE);
    controller.setAccountDetails([
      {
        address: "0xc96348083d806DFfc546b36e05AF1f9452CDAe91",
        details: "details",
        custodyType: "test",
        custodianName: "saturn",
      } as unknown as CustodyAccountDetails,
    ]);
    expect(controller.getCustodyTypeByAddress("0xc96348083d806DFfc546b36e05AF1f9452CDAe91")).toBe("test");

    expect(controller.getAllCustodyTypes().values().next().value).toBe("test");
  });

  it("should get account details", async () => {
    const controller = await createController(INIT_STATE);
    controller.setAccountDetails([
      {
        address: "0xc96348083d806DFfc546b36e05AF1f9452CDAe91",
        details: "details",
        custodyType: "test",
      } as unknown as CustodyAccountDetails,
    ]);

    const result = controller.getAccountDetails("0xc96348083d806DFfc546b36e05AF1f9452CDAe91");
    expect(result.address).toBe("0xc96348083d806DFfc546b36e05AF1f9452CDAe91");
  });

  it("should set waitForConfirmDeepLinkDialog to true", async function () {
    const controller = await createController(INIT_STATE);
    await controller.setWaitForConfirmDeepLinkDialog(true);
    const state = controller.store.getState();
    expect(state.waitForConfirmDeepLinkDialog).toBe(true);
  });

  it("should remove account from account details", async function () {
    const accountToRemove = {
      ["0xc96348083d806DFfc546b36e05AF1f9452CDAe91"]: {
        address: "0xc96348083d806DFfc546b36e05AF1f9452CDAe91",
        details: "details",
        custodyType: "test",
      },
    };
    const controller = await createController({
      ...INIT_STATE,
      custodyAccountDetails: {
        ...INIT_STATE.custodyAccountDetails,
        ...accountToRemove,
      },
    });
    controller.removeAccount("0xc96348083d806DFfc546b36e05AF1f9452CDAe91");
    expect(controller.getCustodyTypeByAddress("0xc96348083d806DFfc546b36e05AF1f9452CDAe91")).toBe(undefined);
  });

  it("should return true for custodian type in use", async function () {
    const accountMock = {
      ["0xc96348083d806DFfc546b36e05AF1f9452CDAe91"]: {
        address: "0xc96348083d806DFfc546b36e05AF1f9452CDAe91",
        details: "details",
        custodyType: "Custody - Jupiter",
      },
    };

    const controller = await createController({
      ...INIT_STATE,
      custodyAccountDetails: {
        ...INIT_STATE.custodyAccountDetails,
        ...accountMock,
      },
    });

    const connectRequest = {
      origin: "https://jupiter-custody-ui.codefi.network/",
      params: {
        custodianName: "jupiter",
      },
    };

    const result = await controller.handleMmiCustodianInUse(connectRequest);
    expect(result).toBe(true);
  });

  it("should fail if the origin does not match", async function () {
    const accountMock = {
      ["0xc96348083d806DFfc546b36e05AF1f9452CDAe91"]: {
        address: "0xc96348083d806DFfc546b36e05AF1f9452CDAe91",
        details: "details",
        custodyType: "Custody - Jupiter",
      },
    };

    const controller = await createController({
      ...INIT_STATE,
      custodyAccountDetails: {
        ...INIT_STATE.custodyAccountDetails,
        ...accountMock,
      },
    });

    const connectRequest = {
      origin: "http://space.com",
      params: {
        custodianName: "jupiter",
      },
    };

    const t = () => {
      controller.handleMmiCustodianInUse(connectRequest);
    };

    expect(t).toThrow("Forbidden");
  });

  it("should fail if there is no such custodian", async function () {
    const accountMock = {
      ["0xc96348083d806DFfc546b36e05AF1f9452CDAe91"]: {
        address: "0xc96348083d806DFfc546b36e05AF1f9452CDAe91",
        details: "details",
        custodyType: "Custody - Jupiter",
      },
    };

    const controller = await createController({
      ...INIT_STATE,
      custodyAccountDetails: {
        ...INIT_STATE.custodyAccountDetails,
        ...accountMock,
      },
    });

    const connectRequest = {
      origin: "https://jupiter-custody-ui.codefi.network/",
      params: {
        custodianName: "fake",
      },
    };

    const t = () => {
      controller.handleMmiCustodianInUse(connectRequest);
    };

    expect(t).toThrow("Forbidden");
  });
});
