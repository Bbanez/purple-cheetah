import { JWTAuth } from './jwt-auth';
import { Permission, PermissionName } from './models/jwt-permission.model';
import { RoleName } from './models/jwt-role.model';
import { JWTEncoding } from './jwt-encoding';

export class JWTValidator {
  public static bearerTokenValidate(
    authorization: string | undefined,
    roleNames: RoleName[],
    permissionName: PermissionName,
    error: {
      occurred: (status: number, data: any) => any;
    },
    config?: {
      issuer: string,
      secret: string,
    },
  ) {
    if (!authorization) {
      throw error.occurred(400, 'Missing authorization data.');
    }
    const jwt = JWTEncoding.decode(authorization);
    if (jwt instanceof Error) {
      throw error.occurred(401, jwt.message);
    }
    const parts: string[] = authorization.split('.');
    const h = parts[0].replace('Bearer ', '');
    const p = parts[1];
    const jvalidate = JWTAuth.rawValidate(jwt, h, p, config);
    if (typeof jvalidate === 'string') {
      throw error.occurred(401, jvalidate);
    }
    const role = jwt.payload.roles.find(r => {
      const roleName = roleNames.find(rn => {
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
      throw error.occurred(403, 'Token is not authorized for this action.');
    }
    const permission: Permission | undefined = role.permissions.find(e => {
      if (e.name === permissionName) {
        return true;
      }
      return false;
    });
    if (!permission) {
      throw error.occurred(403, 'Token is not authorized for this action.');
    }
    return jwt;
  }
}
