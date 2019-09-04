import { Role } from './jwt-role.model';

export class JWTPayload {
  constructor(
    public jti: string,
    public iss: string,
    public iat: number,
    public exp: number,
    public userId: string,
    public roles: Role[],
    public customPool: any,
  ) {}
}
