import { JWTPayload } from '../jwt-payload.model';
import { JWTConfig } from '../../jwt-config';

export class JWTPayloadFactory {
  public static get instance(): JWTPayload {
    return new JWTPayload(
      '',
      JWTConfig.get('issuer'),
      Date.now(),
      Date.now() + JWTConfig.get('expIn'),
      '',
      [],
      {},
    );
  }

  public static fromJSON(json: any): JWTPayload {
    return new JWTPayload(
      json.jti,
      json.iss,
      json.iat,
      json.exp,
      json.userId,
      json.roles,
      json.customPool,
    );
  }

  public static fromJSONArray(json: any[]): JWTPayload[] {
    return json.map(j => {
      return this.fromJSON(j);
    });
  }
}
