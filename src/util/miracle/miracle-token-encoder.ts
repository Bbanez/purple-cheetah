import { MiracleToken } from './models/miracle-token.model';

export class MiracleTokenEncoding {
  public static encode(token: MiracleToken): string {
    const header = this.base64url(JSON.stringify(token.header));
    const payload = this.base64url(JSON.stringify(token.payload));
    return header + '.' + payload + '.' + token.signature;
  }

  public static decode(encodedToken: string): MiracleToken {
    if (encodedToken.startsWith('Bearer ') === false) {
      throw new Error('Bad access token schema.');
    }
    const parts: string[] = encodedToken.replace('Bearer ', '').split('.');
    if (parts.length !== 3) {
      throw new Error('Access token parts length is != 3.');
    }
    try {
      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const jwt: MiracleToken = { header, payload, signature: parts[2] };
      return jwt;
    } catch (error) {
      throw new Error('Bad encoding.');
    }
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
