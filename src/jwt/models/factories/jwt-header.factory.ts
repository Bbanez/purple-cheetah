import { JWTHeader } from '../jwt-header.model';

export class JWTHeaderFactory {
  public static get instance(): JWTHeader {
    return new JWTHeader('JWT', 'HS256');
  }

  public static fromJSON(json: any): JWTHeader {
    return new JWTHeader(json.type, json.alg);
  }

  public static fromJSONArray(json: any[]): JWTHeader[] {
    return json.map(j => {
      return this.fromJSON(j);
    });
  }
}
