import { ITransactionStatus } from "@metamask-institutional/types";

import { CustodyController } from "./custody";
import { CustodyAccountDetails } from "./types";

describe("CustodyController", function () {
  const INIT_STATE = {
    custodyAccountDetails: {
      "0x58183d520cf53a2aac1b02aa11d1c226453e1745": { custodyType: "Custody - Qredo" },
      "0xbf59cbfb3a4df99380b273a685db5f3248333bab": { custodyType: "Custody - Curv" },
      "0xc96348083d806DFfc546b36e05AF1f9452CDAe91": { custodyType: "Custody - JSONRPC" },
    },
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
    controller.storeSupportedChainsForAddress("0x", ["1", "2"], "JSONRPC");
    const state = controller.store.getState();
    expect(state.custodianSupportedChains).toEqual({
      "0x": {
        supportedChains: ["1", "2"],
        custodianName: "JSONRPC",
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
    expect(controller.getCustodyTypeByAddress("0xc96348083d806DFfc546b36e05AF1f9452CDAe91")).toBe("Custody - JSONRPC");
    expect(controller.getAllCustodyTypes().values().next().value).toBe("Custody - JSONRPC");
  });

  it("should filter our Qredo and Curv custody types and return only JSONRPC", async function () {
    const controller = await createController(INIT_STATE);
    controller.setAccountDetails([
      {
        address: "0xc96348083d806DFfc546b36e05AF1f9452CDAe91",
        details: "details",
        custodyType: "Custody - JSONRPC",
        custodianName: "saturn",
      } as unknown as CustodyAccountDetails,
      {
        address: "0x58183d520cf53a2aac1b02aa11d1c226453e1745",
        details: "details",
        custodyType: "Custody - Qredo",
        custodianName: "qredo",
      } as unknown as CustodyAccountDetails,
      {
        address: "0xbf59cbfb3a4df99380b273a685db5f3248333bab",
        details: "details",
        custodyType: "Custody - Curv",
        custodianName: "curv",
      } as unknown as CustodyAccountDetails,
    ]);
    expect(controller.getCustodyTypeByAddress("0xc96348083d806DFfc546b36e05AF1f9452CDAe91")).toBe("Custody - JSONRPC");
    expect(controller.getCustodyTypeByAddress("0x58183d520cf53a2aac1b02aa11d1c226453e1745")).toBe("Custody - Qredo");
    expect(controller.getCustodyTypeByAddress("0xbf59cbfb3a4df99380b273a685db5f3248333bab")).toBe("Custody - Curv");

    expect(controller.getAllCustodyTypes().values().next().value).toBe("Custody - JSONRPC");
  });

  it("should get account details", async () => {
    const controller = await createController(INIT_STATE);
    controller.setAccountDetails([
      {
        address: "0xc96348083d806DFfc546b36e05AF1f9452CDAe91",
        details: "details",
        custodyType: "Custody - JSONRPC",
      } as unknown as CustodyAccountDetails,
    ]);

    const result = controller.getAccountDetails("0xc96348083d806DFfc546b36e05AF1f9452CDAe91");
    expect(result.custodyType).toBe("Custody - JSONRPC");
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

  it("should fail if the origin does not match", async function () {
    const accountMock = {
      ["0xc96348083d806DFfc546b36e05AF1f9452CDAe91"]: {
        address: "0xc96348083d806DFfc546b36e05AF1f9452CDAe91",
        details: "details",
        custodyType: "Custody - JSONRPC",
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
        custodianName: "JSONRPC",
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
        custodyType: "Custody - JSONRPC",
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
      origin: "https://saturn-custody-ui.dev.metamask-institutional.io/",
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
