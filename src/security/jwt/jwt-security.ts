import { Types } from 'mongoose';
import * as crypto from 'crypto';
import { JWTEncoding } from './jwt-encoding';
import {
  JWT,
  Permission,
  PermissionName,
  JWTConfig,
  Role,
  RoleName,
  JWTEncryptionAlg,
} from './interfaces';

/**
 * Helper class used for creating and validating JWTs.
 */
export class JWTSecurity {
  /**
   * Will create a new JWT with selected options.
   *
   * @param userId ID of a used for whom token is created
   * @param roles Allowed user roles
   * @param config Configuration for a token
   * @param customPool Custom user properties.
   */
  public static createToken(
    userId: string,
    roles: Role[],
    config: JWTConfig,
    customPool?: any,
  ): JWT {
    const jwt: JWT = {
      header: {
        type: 'JWT',
        alg: config.alg,
      },
      payload: {
        jti: new Types.ObjectId().toHexString(),
        iss: config.issuer,
        exp: config.expIn,
        iat: Date.now(),
        userId,
        roles,
        customPool: {},
      },
      signature: '',
    };
    if (customPool) {
      jwt.payload.customPool = customPool;
    }
    jwt.signature = JWTSecurity.signToken(jwt, config.secret);
    return jwt;
  }

  /**
   * Create a signature for a given JWT.
   */
  public static signToken(jwt: JWT, secret: string): string {
    const header = JWTEncoding.base64url(JSON.stringify(jwt.header));
    const payload = JWTEncoding.base64url(JSON.stringify(jwt.payload));
    let hmac: crypto.Hmac;
    switch (jwt.header.alg) {
      case JWTEncryptionAlg.HMACSHA256:
        {
          hmac = crypto.createHmac('sha256', secret);
        }
        break;
      case JWTEncryptionAlg.HMACSHA512:
        {
          hmac = crypto.createHmac('sha512', secret);
        }
        break;
    }
    hmac.setEncoding('base64');
    hmac.write(header + '.' + payload);
    hmac.end();
    return JWTEncoding.trimBase64url(hmac.read().toString());
  }

  /**
   * Check if a given JWT is valid according to a
   * provided JWT configuration.
   */
  public static validateToken(jwt: JWT, config: JWTConfig): void | Error {
    if (config.issuer !== jwt.payload.iss) {
      return new Error('Bad token issuer.');
    }
    if (
      !jwt.payload.userId ||
      jwt.payload.userId === null ||
      jwt.payload.userId.trim() === ''
    ) {
      return new Error('Missing property `userId` in payload.');
    }
    if (jwt.payload.iat + jwt.payload.exp < Date.now()) {
      return new Error('Token has expired.');
    }
    const checkSign: string = JWTSecurity.signToken(jwt, config.secret);
    if (checkSign !== jwt.signature) {
      return new Error('Bad token signature.');
    }
  }

  /**
   * For a given a roles and permission, check
   * if JWT is valid.
   */
  public static checkTokenPermissions(
    jwt: JWT,
    roleNames: RoleName[],
    permissionName: PermissionName,
  ): void | Error {
    const role = jwt.payload.roles.find((r) => {
      const roleName = roleNames.find((rn) => {
        if (rn === r.name) {
          return true;
        }
        return false;
      });
      if (roleName) {
        return true;
      }
      return false;
    });
    if (!role) {
      return new Error('Token is not authorized for this action.');
    }
    const permission: Permission | undefined = role.permissions.find((e) => {
      if (e.name === permissionName) {
        return true;
      }
      return false;
    });
    if (!permission) {
      return new Error('Token is not authorized for this action.');
    }
  }

  public static validateAndCheckTokenPermissions(
    jwt: JWT,
    roleNames: RoleName[],
    permissionName: PermissionName,
    config: JWTConfig,
  ): void | Error {
    let error = JWTSecurity.validateToken(jwt, config);
    if (error instanceof Error) {
      return error;
    }
    error = JWTSecurity.checkTokenPermissions(jwt, roleNames, permissionName);
    if (error instanceof Error) {
      return error;
    }
  }
}
