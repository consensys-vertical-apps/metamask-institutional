import { IRefreshTokenAuthDetails } from './auth/IRefreshTokenAuthDetails';
import { ITokenAuthDetails } from './auth/ITokenAuthDetails';

export type AuthDetails = ITokenAuthDetails | IRefreshTokenAuthDetails;
