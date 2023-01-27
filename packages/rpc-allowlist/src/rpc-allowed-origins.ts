export const RPC_ALLOWED_ORIGINS = {
  metamaskinstitutional_portfolio: [
    /^http:\/\/localhost:3001/,
    /^http:\/\/host.docker.internal:3001/,
    /^https:\/\/(.*)?metamask-institutional.io/,
    /^https:\/\/[a-zA-Z0-9-]*.codefi.network/,
  ],
  metamaskinstitutional_open_swaps: [
    /^http:\/\/localhost:3001/,
    /^http:\/\/host.docker.internal:3001/,
    /^https:\/\/(.*)?metamask-institutional.io/,
    /^https:\/\/[a-zA-Z0-9-]*.codefi.network/,
  ],
};
