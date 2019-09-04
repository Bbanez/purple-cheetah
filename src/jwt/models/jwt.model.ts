import { JWTHeader } from './jwt-header.model';
import { JWTPayload } from './jwt-payload.model';

export class JWT {
  constructor(
    public header: JWTHeader,
    public payload: JWTPayload,
    public signature: string,
  ) {}
}
