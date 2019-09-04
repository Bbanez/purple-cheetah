import { MiracleToken } from './models/miracle-token.model';
import { MiracleTokenHashing } from './miracle-token-hashing';

export class MiracleTokenValidation {
  public static validate(token: MiracleToken): void {
    const checkSign: string = MiracleTokenHashing.sign(token);
    if (checkSign !== token.signature) {
      throw new Error('Bad signature.');
    }
    if (process.env.MIRACLE_TOKEN_ISSUER !== token.payload.iss) {
      throw new Error('Bad issuer.');
    }
    if (
      !token.payload.userKey ||
      token.payload.userKey === null ||
      token.payload.userKey.trim() === ''
    ) {
      throw new Error('Missing `userKey`.');
    }
    if (token.payload.iat + token.payload.exp < Date.now()) {
      throw new Error('Token has expired.');
    }
  }

  public static rawValidate(
    token: MiracleToken,
    header: string,
    payload: string,
  ): void {
    const checkSign: string = MiracleTokenHashing.rawSign(header, payload);
    if (checkSign !== token.signature) {
      throw new Error('Bad signature.');
    }
    if (process.env.MIRACLE_TOKEN_ISSUER !== token.payload.iss) {
      throw new Error('Bad issuer.');
    }
    if (
      !token.payload.userKey ||
      token.payload.userKey === null ||
      token.payload.userKey.trim() === ''
    ) {
      throw new Error('Missing `userId`.');
    }
    if (token.payload.iat + token.payload.exp < Date.now()) {
      throw new Error('Token has expired.');
    }
  }
}
