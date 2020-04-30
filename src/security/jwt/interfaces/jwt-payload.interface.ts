import { Role } from './jwt-role.interface';

export interface JWTPayload {
  jti: string;
  iss: string;
  iat: number;
  exp: number;
  userId: string;
  roles: Role[];
  customPool: any;
}
