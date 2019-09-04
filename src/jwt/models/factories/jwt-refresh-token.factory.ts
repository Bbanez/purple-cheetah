import * as crypto from 'crypto';
import { RefreshToken } from '../jwt-refresh-token.model';
import { JWTConfig } from '../../jwt-config.util';

export class RefreshTokenFactory {
  public static get instance(): RefreshToken {
    const hash = crypto.createHash('sha512');
    hash.update(crypto.randomBytes(256));
    const value: string = hash.digest('hex');
    const expAt: number = Date.now() + JWTConfig.get('refTokenExpIn');
    return new RefreshToken(value, expAt);
  }
}
