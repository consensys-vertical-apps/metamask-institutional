import { IRefreshTokenAuthDetails } from "../IRefreshTokenAuthDetails";
import { ITokenAuthDetails } from "../ITokenAuthDetails";

export type AuthDetails = ITokenAuthDetails | IRefreshTokenAuthDetails;
