import { Types } from 'mongoose';

import { JWTPayloadFactory } from './jwt-payload.factory';
import { JWTHeaderFactory } from './jwt-header.factory';
import { JWT } from '../jwt.model';
import { JWTPayload } from '../jwt-payload.model';
import { Role } from '../jwt-role.model';
import { JWTConfig } from '../../jwt-config';
import { JWTAuth } from '../../jwt-auth';

export class JWTFactory {
  public static get instance(): JWT {
    const p: JWTPayload = JWTPayloadFactory.instance;
    p.jti = new Types.ObjectId().toHexString();
    return new JWT(JWTHeaderFactory.instance, p, '');
  }

  public static fromJSON(json: any): JWT {
    return new JWT(
      JWTHeaderFactory.fromJSON(json.header),
      JWTPayloadFactory.fromJSON(json.payload),
      json.signature,
    );
  }

  public static fromJSONArray(json: any[]): JWT[] {
    return json.map(j => {
      return this.fromJSON(j);
    });
  }

  public static create(user: {
    _id: Types.ObjectId;
    roles: Role[];
    customPool: any;
  }): JWT {
    const jwt: JWT = this.instance;
    jwt.payload.userId = user._id.toHexString();
    jwt.payload.exp = JWTConfig.get('expIn');
    jwt.payload.iat = Date.now();
    jwt.payload.iss = JWTConfig.get('issuer');
    jwt.payload.roles = user.roles;
    jwt.payload.customPool = user.customPool;
    jwt.signature = JWTAuth.sign(jwt);
    return jwt;
  }
}