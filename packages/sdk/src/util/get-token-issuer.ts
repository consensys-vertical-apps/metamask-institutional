import jwt from "jsonwebtoken";

export function getTokenIssuer(token: string) {
  const decoded = jwt.decode(token.trim());
  // @ts-ignore
  if (!decoded.iss) {
    throw new Error("Missing `iss` claim in token");
  }

  // @ts-ignore
  return decoded.iss;
}
