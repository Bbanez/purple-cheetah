import { MiracleToken } from '../miracle-token.model';
import { MiracleUser } from '../miracle-user.model';
import { MiracleTokenHashing } from '../../miracle-token-hashing';

export class MiracleTokenFactory {
  public static get instance(): MiracleToken {
    return {
      header: {
        type: 'JWT',
        alg: 'HS256',
      },
      payload: {
        iss: process.env.MIRACLE_TOKEN_ISSUER,
        iat: Date.now(),
        exp: parseInt(process.env.MIRACLE_TOKEN_EXP_IN, 10),
        userKey: '',
      },
      signature: '',
    };
  }

  public static create(
    user: MiracleUser,
  ): MiracleToken {
    const token = this.instance;
    token.payload.userKey = user.key;
    MiracleTokenHashing.sign(token);
    return token;
  }
}
