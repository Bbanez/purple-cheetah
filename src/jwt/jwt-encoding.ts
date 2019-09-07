import { JWT } from './interfaces/jwt.interface';
import { JWTHeader } from './interfaces/jwt-header.interface';
import { JWTPayload } from './interfaces/jwt-payload.interface';
import { ObjectUtility } from 'src/util/object.util';

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
      const header: JWTHeader = JSON.parse(
        Buffer.from(parts[0], 'base64').toString(),
      );
      const payload: JWTPayload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString(),
      );
      try {
        ObjectUtility.compareWithSchema(
          header,
          {
            type: {
              __type: 'string',
              __required: true,
            },
            alg: {
              __type: 'string',
              __required: true,
            },
          },
          'token.header',
        );
        ObjectUtility.compareWithSchema(
          payload,
          {
            jti: {
              __type: 'string',
              __required: true,
            },
            iss: {
              __type: 'string',
              __required: true,
            },
            iat: {
              __type: 'number',
              __required: true,
            },
            exp: {
              __type: 'number',
              __required: true,
            },
            userId: {
              __type: 'string',
              __required: true,
            },
            roles: {
              __type: 'array',
              __required: true,
              __child: {
                __type: 'object',
                __content: {
                  name: {
                    __type: 'string',
                    __required: true,
                  },
                  permissions: {
                    __type: 'array',
                    __required: true,
                    __child: {
                      __type: 'object',
                      __content: {
                        name: {
                          __type: 'string',
                          __required: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          'token.payload',
        );
      } catch (e) {
        return e;
      }
      const jwt: JWT = {
        header,
        payload,
        signature: parts[2],
      };
      return jwt;
    } catch (error) {
      return new Error('Bad token encoding.');
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
