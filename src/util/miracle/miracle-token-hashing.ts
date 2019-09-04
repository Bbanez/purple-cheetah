import * as crypto from 'crypto';
import { MiracleToken } from './models/miracle-token.model';

export class MiracleTokenHashing {
  public static sign(token: MiracleToken): string {
    const header = this.base64url(JSON.stringify(token.header));
    const payload = this.base64url(JSON.stringify(token.payload));
    const hmac = crypto.createHmac('sha256', process.env.MIRACLE_TOKEN_SECRET);
    hmac.setEncoding('base64');
    hmac.write(header + '.' + payload);
    hmac.end();
    return this.trimBase64url(hmac.read().toString());
  }

  public static rawSign(header: string, payload: string): string {
    const hmac = crypto.createHmac('sha256', process.env.MIRACLE_TOKEN_SECRET);
    hmac.setEncoding('base64');
    hmac.write(header + '.' + payload);
    hmac.end();
    return this.trimBase64url(hmac.read().toString());
  }

  /**
   * Get Base64 URL Encoded string.
   * @param data String that will be encoded.
   */
  private static base64url(data: string): string {
    return this.trimBase64url(Buffer.from(data).toString('base64'));
  }

  /**
   * Convert Base64 string to Base64 URL Encoded string.
   * @param data Base64 string.
   */
  private static trimBase64url(data: string): string {
    return data
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
}
