import * as Auth0Library from "@auth0/auth0-spa-js";

import { Auth0 } from "./Auth0";

jest.mock("@auth0/auth0-spa-js", () => {
  return {
    Auth0Client: jest.fn().mockImplementation(() => ({
      loginWithPopup: jest.fn(),
      getUser: jest.fn(() => "user"),
      getTokenSilently: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: jest.fn(),
    })),
  };
});

describe("Auth0", () => {
  let auth0: Auth0;

  beforeAll(() => {
    auth0 = new Auth0();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createClient", () => {
    it("should instantiate the auth0 library", async () => {
      const params = {
        domain: "test",
        clientId: "test",
      };

      await auth0.createClient(params);

      expect(Auth0Library.Auth0Client).toHaveBeenCalledWith(params);
      expect(auth0.auth0Client.loginWithPopup).toHaveBeenCalled();
    });
  });
  describe("getUser", () => {
    it("should call getUser", async () => {
      const params = {
        domain: "test",
        clientId: "test",
      };

      await auth0.createClient(params);

      const user = auth0.getUser();

      expect(user).toEqual("user");
    });
  });

  describe("getAccessToken", () => {
    it("should invoke getTokenSilently", async () => {
      const params = {
        domain: "test",
        clientId: "test",
      };

      await auth0.createClient(params);

      await auth0.getAccessToken();

      expect(auth0.auth0Client.getTokenSilently).toHaveBeenCalled();
    });
  });

  describe("isAuthenticated", () => {
    it("should invoke isAuthenticated", async () => {
      const params = {
        domain: "test",
        clientId: "test",
      };

      await auth0.createClient(params);

      await auth0.isAuthenticated();

      expect(auth0.auth0Client.isAuthenticated).toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("should invoke logout and delete the user prop", async () => {
      const params = {
        domain: "test",
        clientId: "test",
      };

      await auth0.createClient(params);

      await auth0.logout();

      expect(auth0.auth0Client.logout).toHaveBeenCalled();

      expect(auth0.getUser()).toEqual(undefined);
    });
  });
});
