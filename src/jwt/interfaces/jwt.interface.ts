import { JWTPayload } from './jwt-payload.interface';
import { JWTHeader } from './jwt-header.interface';

export interface JWT {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
}
