import * as crypto from 'crypto';
import { JWT } from './models/jwt.model';
import { JWTConfig } from './jwt-config';
import { JWTEncoding } from './jwt-encoding';

export class JWTAuth {
  public static sign(jwt: JWT, secret?: string): string {
    const header = JWTEncoding.base64url(JSON.stringify(jwt.header));
    const payload = JWTEncoding.base64url(JSON.stringify(jwt.payload));
    let hmac: crypto.Hmac;
    if (secret) {
      hmac = crypto.createHmac('sha256', secret);
    } else {
      hmac = crypto.createHmac('sha256', JWTConfig.get('secret'));
    }
    hmac.setEncoding('base64');
    hmac.write(header + '.' + payload);
    hmac.end();
    return JWTEncoding.trimBase64url(hmac.read().toString());
  }

  public static rawSign(header: string, payload: string, secret?: string): string {
    let hmac: crypto.Hmac;
    if (secret) {
      hmac = crypto.createHmac('sha256', secret);
    } else {
      hmac = crypto.createHmac('sha256', JWTConfig.get('secret'));
    }
    hmac.setEncoding('base64');
    hmac.write(header + '.' + payload);
    hmac.end();
    return JWTEncoding.trimBase64url(hmac.read().toString());
  }

  public static validate(
    jwt: JWT,
    config?: {
      secret: string;
      issuer: string;
    },
  ): boolean | string {
    if (config) {
      if (config.issuer !== jwt.payload.iss) {
        return 'Bad token issuer.';
      }
      if (
        !jwt.payload.userId ||
        jwt.payload.userId === null ||
        jwt.payload.userId.trim() === ''
      ) {
        return 'Missing property `userId` in payload.';
      }
      if (jwt.payload.iat + jwt.payload.exp < Date.now()) {
        return 'Token has expired.';
      }
      const checkSign: string = this.sign(jwt, config.secret);
      if (checkSign !== jwt.signature) {
        return 'Bad token signature.';
      }
    } else {
      if (JWTConfig.get('issuer') !== jwt.payload.iss) {
        return 'Bad issuer.';
      }
      if (
        !jwt.payload.userId ||
        jwt.payload.userId === null ||
        jwt.payload.userId.trim() === ''
      ) {
        return 'Missing `userId`.';
      }
      if (jwt.payload.iat + jwt.payload.exp < Date.now()) {
        return 'Token has expired.';
      }
      const checkSign: string = this.sign(jwt);
      if (checkSign !== jwt.signature) {
        return 'Bad signature.';
      }
    }
    return true;
  }

  public static rawValidate(
    jwt: JWT,
    h: string,
    p: string,
    config?: {
      secret: string;
      issuer: string;
    },
  ): boolean | string {
    if (config) {
      const checkSign: string = this.rawSign(h, p, config.secret);
      if (checkSign !== jwt.signature) {
        return 'Bad signature.';
      }
      if (config.issuer !== jwt.payload.iss) {
        return 'Bad issuer.';
      }
      if (
        !jwt.payload.userId ||
        jwt.payload.userId === null ||
        jwt.payload.userId.trim() === ''
      ) {
        return 'Missing `userId`.';
      }
      if (jwt.payload.iat + jwt.payload.exp < Date.now()) {
        return 'Token has expired.';
      }
    } else {
      const checkSign: string = this.rawSign(h, p);
      if (checkSign !== jwt.signature) {
        return 'Bad signature.';
      }
      if (JWTConfig.get('issuer') !== jwt.payload.iss) {
        return 'Bad issuer.';
      }
      if (
        !jwt.payload.userId ||
        jwt.payload.userId === null ||
        jwt.payload.userId.trim() === ''
      ) {
        return 'Missing `userId`.';
      }
      if (jwt.payload.iat + jwt.payload.exp < Date.now()) {
        return 'Token has expired.';
      }
    }
    return true;
  }
}
