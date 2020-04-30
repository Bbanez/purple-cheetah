import { JWTEncryptionAlg } from './jwt-header.interface';

export interface JWTConfig {
  id: string;
  secret: string;
  expIn: number;
  issuer: string;
  alg: JWTEncryptionAlg;
}
