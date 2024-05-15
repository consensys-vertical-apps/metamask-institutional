export interface ICactusAccessTokenResponse {
  jwt: string;
  error: {
    message: string;
    code: number;
  };
}
