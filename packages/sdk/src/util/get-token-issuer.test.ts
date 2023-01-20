import jwt from "jsonwebtoken";
jest.mock("jsonwebtoken", () => ({
  decode: jest.fn(),
}));

import { mocked } from "ts-jest/utils";

import { getTokenIssuer } from "./get-token-issuer";

describe("getTokenIssuer", () => {
  const jwtmock = mocked(jwt);

  it("will fail if there is no iss claim in the token", () => {
    jwtmock.decode.mockImplementationOnce(() => ({
      claim: "no",
    }));

    expect(() => getTokenIssuer("token")).toThrowError(
      "Missing `iss` claim in token"
    );
  });

  it("will return the issuer of the token", () => {
    jwtmock.decode.mockImplementationOnce(() => ({
      iss: "issuer",
    }));

    const result = getTokenIssuer("token");
    expect(result).toEqual("issuer");

    expect(jwtmock.decode).toHaveBeenCalledWith("token");
  });

  it("will trim any whitespace off the token", () => {
    jwtmock.decode.mockImplementationOnce(() => ({
      iss: "issuer",
    }));

    const result = getTokenIssuer("token\n\n");
    expect(result).toEqual("issuer");

    expect(jwtmock.decode).toHaveBeenCalledWith("token");
  });
});
