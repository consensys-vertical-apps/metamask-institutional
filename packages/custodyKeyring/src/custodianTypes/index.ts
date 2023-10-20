import { ICustodianType } from "@metamask-institutional/types";

import { BitgoCustodyKeyring } from "./bitgo/BitgoCustodyKeyring";
import { CactusCustodyKeyring } from "./cactus/CactusCustodyKeyring";
import { CurvCustodyKeyring } from "./curv/CurvCustodyKeyring";
import { JsonRpcCustodyKeyring } from "./json-rpc/JsonRpcCustodyKeyring";
import { JupiterCustodyKeyring } from "./jupiter/JupiterCustodyKeyring";
import { QredoCustodyKeyring } from "./qredo/QredoCustodyKeyring";
import { ECA3CustodyKeyring } from "./eca3/ECA3CustodyKeyring";

export const CUSTODIAN_TYPES: { [key: string]: ICustodianType } = {
  QREDO: {
    name: "Qredo",
    displayName: "Qredo",
    apiUrl: "https://api.qredo.network",
    imgSrc: "https://dashboard.metamask-institutional.io/custodian-icons/qredo-icon.svg",
    icon: "https://dashboard.metamask-institutional.io/custodian-icons/qredo-icon.svg",
    website: 'https://www.qredo.com',
    envName: 'qredo',
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
    imgSrc: "https://dashboard.metamask-institutional.io/custodian-icons/cactus-icon.svg",
    icon: "https://dashboard.metamask-institutional.io/custodian-icons/cactus-icon.svg",
    website: 'https://www.mycactus.com',
    envName: 'cactus',
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
    imgSrc: "https://dashboard.metamask-institutional.io/custodian-icons/bitgo-icon.svg",
    icon: "https://dashboard.metamask-institutional.io/custodian-icons/bitgo-icon.svg",
    website: 'https://www.bitgo.com',
    envName: 'bitgo',
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
  JUPITER: {
    name: "Jupiter",
    displayName: "Jupiter Custody",
    apiUrl: "https://jupiter-custody.codefi.network",
    imgSrc: "https://saturn-custody-ui.metamask-institutional.io/saturn.svg",
    icon: "https://saturn-custody-ui.metamask-institutional.io/saturn.svg",
    website: '',
    envName: '',
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

  // All new custodians are an instance of this type
  JSONRPC: {
    name: "JSONRPC",
    displayName: "JSON-RPC",
    apiUrl: "https://saturn-custody.codefi.network/eth",
    imgSrc: "https://saturn-custody-ui.metamask-institutional.io/saturn.svg",
    icon: "https://saturn-custody-ui.metamask-institutional.io/saturn.svg",
    website: 'https://saturn-custody-ui.metamask-institutional.io/',
    envName: 'saturn-prod',
    keyringClass: JsonRpcCustodyKeyring,
    production: false,
    hidden: true, // Since this is the prototype, we don't want to show it in the UI
    origins: [],
    environmentMapping: [], // No environment mapping for JSON-RPC custodians as this is derived from the configuration service
  },

    // All new custodians are an instance of this type
    ECA3: {
      name: "ECA3",
      displayName: "ECA3",
      apiUrl: "https://neptune-custody.codefi.network/eth",
      imgSrc: "https://backend.vistan-brillen.de/storage/files/images/marken/changeme/header/changeme-logo-header.jpg",
      icon: "https://backend.vistan-brillen.de/storage/files/images/marken/changeme/header/changeme-logo-header.jpg",
      website: 'https://neptune-custody-ui.metamask-institutional.io/',
      envName: 'neptune-custody',
      keyringClass: ECA3CustodyKeyring,
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
    website: '',
    envName: '',
    keyringClass: CurvCustodyKeyring,
    production: false,
    hidden: true,
    origins: [],
    environmentMapping: [],
  },
};
