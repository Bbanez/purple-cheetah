import * as crypto from 'crypto';
import { JWT } from './models/jwt.model';
import { JWTConfig, IJWTConfig } from './jwt-config.util';
import { JWTHeader } from './models/jwt-header.model';
import { JWTHeaderFactory } from './models/factories/jwt-header.factory';
import { JWTPayloadFactory } from './models/factories/jwt-payload.factory';
import { JWTPayload } from './models/jwt-payload.model';

export class JWTAuth {
  public static sign(jwt: JWT, secret?: string): string {
    const header = this.base64url(JSON.stringify(jwt.header));
    const payload = this.base64url(JSON.stringify(jwt.payload));
    let hmac: crypto.Hmac;
    if (secret) {
      hmac = crypto.createHmac('sha256', secret);
    } else {
      hmac = crypto.createHmac('sha256', JWTConfig.get('secret'));
    }
    hmac.setEncoding('base64');
    hmac.write(header + '.' + payload);
    hmac.end();
    return this.trimBase64url(hmac.read().toString());
  }

  public static rawSign(h: string, p: string, secret?: string): string {
    let hmac: crypto.Hmac;
    if (secret) {
      hmac = crypto.createHmac('sha256', secret);
    } else {
      hmac = crypto.createHmac('sha256', JWTConfig.get('secret'));
    }
    hmac.setEncoding('base64');
    hmac.write(h + '.' + p);
    hmac.end();
    return this.trimBase64url(hmac.read().toString());
  }

  public static encode(jwt: JWT): string {
    const header = this.base64url(JSON.stringify(jwt.header));
    const payload = this.base64url(JSON.stringify(jwt.payload));
    return header + '.' + payload + '.' + jwt.signature;
  }

  public static decode(jwtAsString: string): JWT | Error {
    if (jwtAsString.startsWith('Bearer ') === false) {
      return new Error('Bad access token schema.');
    }
    const parts: string[] = jwtAsString.replace('Bearer ', '').split('.');
    if (parts.length !== 3) {
      return new Error('Access token parts length is != 3.');
    }
    try {
      const header: JWTHeader = JWTHeaderFactory.fromJSON(
        JSON.parse(Buffer.from(parts[0], 'base64').toString()),
      );
      const payload: JWTPayload = JWTPayloadFactory.fromJSON(
        JSON.parse(Buffer.from(parts[1], 'base64').toString()),
      );
      const jwt: JWT = new JWT(header, payload, parts[2]);
      return jwt;
    } catch (error) {
      return new Error('Bad encoding.');
    }
  }

  public static validate(
    jwt: JWT,
    config?: {
      secret: string;
      issuer: string;
    },
  ): boolean | string {
    if (config) {
      const checkSign: string = this.sign(jwt, config.secret);
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
      const checkSign: string = this.sign(jwt);
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

  /**
   * Get Base64 URL Encoded string.
   * @param data String that will be encoded.
   */
  public static base64url(data: string): string {
    return this.trimBase64url(Buffer.from(data).toString('base64'));
  }

  /**
   * Convert Base64 string to Base64 URL Encoded string.
   * @param data Base64 string.
   */
  public static trimBase64url(data: string): string {
    return data
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
}
