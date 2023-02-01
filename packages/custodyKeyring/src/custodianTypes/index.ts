import { ICustodianType } from "@metamask-institutional/types";

import { BitgoCustodyKeyring } from "./bitgo/BitgoCustodyKeyring";
import { CactusCustodyKeyring } from "./cactus/CactusCustodyKeyring";
import { CurvCustodyKeyring } from "./curv/CurvCustodyKeyring";
import { JsonRpcCustodyKeyring } from "./json-rpc/JsonRpcCustodyKeyring";
import { JupiterCustodyKeyring } from "./jupiter/JupiterCustodyKeyring";
import { QredoCustodyKeyring } from "./qredo/QredoCustodyKeyring";

export const CUSTODIAN_TYPES: { [key: string]: ICustodianType } = {
  JUPITER: {
    name: "Jupiter",
    displayName: "Jupiter Custody",
    apiUrl: "https://jupiter-custody.codefi.network",
    imgSrc: "images/jupiter.svg",
    icon: "images/jupiter.svg",
    keyringClass: JupiterCustodyKeyring,
    production: true,
    hidden: false,
    origins: [/^https:\/\/jupiter-custody-ui.codefi.network\//],
    environmentMapping: [
      {
        pattern: /^http:\/\/test-pattern/,
        mmiApiUrl: "http://test-url",
      },
      {
        pattern: /^http:\/\/localhost.*$/,
        mmiApiUrl: "http://localhost:3000/v1",
      },
    ],
  },
  QREDO: {
    name: "Qredo",
    displayName: "Qredo",
    apiUrl: "https://api.qredo.network",
    imgSrc: "images/qredo.svg",
    icon: "images/qredo.svg",
    keyringClass: QredoCustodyKeyring,
    production: true,
    hidden: false,
    origins: [],
    environmentMapping: [
      {
        pattern: /^.*$/u,
        mmiApiUrl: "https://mmi.codefi.network/v1",
      },
      {
        pattern: /^https:\/\/api.qredo.network/u,
        mmiApiUrl: "https://api.mmi-prod.codefi.network/v1",
      },
    ],
  },
  CACTUS: {
    name: "Cactus",
    displayName: "Cactus Custody",
    apiUrl: "https://api.mycactus.com/custody/v1/mmi-api",
    imgSrc: "images/cactus.svg",
    icon: "images/cactus.svg",
    keyringClass: CactusCustodyKeyring,
    production: true,
    hidden: false,
    origins: [],
    environmentMapping: [
      {
        pattern: /^.*$/u,
        mmiApiUrl: "https://mmi.codefi.network/v1",
      },
      {
        pattern: /^https:\/\/api.mycactus.com/u,
        mmiApiUrl: "https://api.mmi-prod.codefi.network/v1",
      },
    ],
  },
  BITGO: {
    name: "Bitgo",
    displayName: "BitGo",
    apiUrl: "https://app.bitgo.com/defi/v2",
    imgSrc: "images/bitgo.svg",
    icon: "images/bitgo.svg",
    keyringClass: BitgoCustodyKeyring,
    production: true,
    hidden: false,
    origins: [],
    environmentMapping: [
      {
        pattern: /^.*$/u,
        mmiApiUrl: "https://mmi.codefi.network/v1",
      },
      {
        pattern: /^https:\/\/app.bitgo-test.com/u,
        mmiApiUrl: "https://mmi.codefi.network/v1",
      },
      {
        pattern: /^https:\/\/app.bitgo.com/u,
        mmiApiUrl: "https://api.mmi-prod.codefi.network/v1",
      },
    ],
  },

  // All new custodians are an instance of this type

  JSONRPC: {
    name: "JSONRPC",
    displayName: "JSON-RPC",
    apiUrl: "https://saturn-custody.codefi.network/eth",
    imgSrc: "images/json-rpc.svg",
    icon: "images/json-rpc.svg",
    keyringClass: JsonRpcCustodyKeyring,
    production: false,
    hidden: true, // Since this is the prototype, we don't want to show it in the UI
    origins: [],
    environmentMapping: [], // No environment mapping for JSON-RPC custodians as this is derived from the configuration service
  },

  // Legacy Custodian

  CURV: {
    name: "Curv",
    displayName: "Curv",
    apiUrl: "https://app.curv.co",
    imgSrc: "images/curv-logo-horizontal-black.svg",
    icon: "images/curv-logo.svg",
    keyringClass: CurvCustodyKeyring,
    production: false,
    hidden: true,
    origins: [],
    environmentMapping: [],
  },
};
