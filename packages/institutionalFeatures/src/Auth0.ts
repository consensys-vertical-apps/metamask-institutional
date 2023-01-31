import { Auth0Client, Auth0ClientOptions, User } from "@auth0/auth0-spa-js";

export class Auth0 {
  auth0Client: Auth0Client;
  private user: User = {};

  getUser(): User {
    return this.user;
  }
  getAccessToken(): Promise<any> {
    return this.auth0Client.getTokenSilently();
  }
  isAuthenticated(): Promise<boolean> {
    return this.auth0Client.isAuthenticated();
  }
  logout(): Promise<any> {
    this.user = undefined;
    return this.auth0Client.logout();
  }

  async createClient(options: Auth0ClientOptions): Promise<any> {
    this.auth0Client = new Auth0Client(options);
    await this.loginWithPopup();
  }

  async loginWithPopup(): Promise<any> {
    await this.auth0Client.loginWithPopup();
    this.user = await this.auth0Client.getUser();
  }
}
