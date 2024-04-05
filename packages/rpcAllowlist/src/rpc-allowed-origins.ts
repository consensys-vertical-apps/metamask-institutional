const MMI_HOSTNAME = "metamask-institutional.io";
const LOCAL_ORIGINS = ["http://localhost:3001", "http://host.docker.internal:3001"];

export function isAllowedRPCOrigin(messageType: string, origin: string) {
  const url = parseUrl(origin);

  if (!url) {
    return false;
  }

  switch (messageType) {
    case "metamaskinstitutional_portfolio":
    case "metamaskinstitutional_open_swaps":
      return isValidMMISubdomain(url) || isValidLocalOrigin(url);
    default:
      return false;
  }
}

function isValidLocalOrigin({ origin }: URL) {
  return LOCAL_ORIGINS.includes(origin);
}

function isValidMMISubdomain({ protocol, hostname }: URL) {
  return protocol === "https:" && hostname.endsWith(`.${MMI_HOSTNAME}`);
}

function parseUrl(origin: string) {
  const trimmedOrigin = origin.endsWith("/") ? origin.slice(0, -1) : origin;

  try {
    return new URL(trimmedOrigin);
  } catch (error) {
    return null;
  }
}
