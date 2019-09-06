import { JWT } from './models/jwt.model';
import { JWTHeader } from './models/jwt-header.model';
import { JWTHeaderFactory } from './models/factories/jwt-header.factory';
import { JWTPayload } from './models/jwt-payload.model';
import { JWTPayloadFactory } from './models/factories/jwt-payload.factory';

export class JWTEncoding {
  public static encode(jwt: JWT): string {
    const header = this.base64url(JSON.stringify(jwt.header));
    const payload = this.base64url(JSON.stringify(jwt.payload));
    return header + '.' + payload + '.' + jwt.signature;
  }

  public static decode(jwtAsString: string): JWT | Error {
    if (jwtAsString.startsWith('Bearer ') === true) {
      jwtAsString = jwtAsString.replace('Bearer ', '');
    }
    const parts: string[] = jwtAsString.split('.');
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
