import { Request } from 'express';
import { HttpException } from '../../models/http-exception.model';
import { HttpStatus } from '../../models/http-status.model';
import { MiracleToken } from './models/miracle-token.model';
import { MiracleTokenEncoding } from './miracle-token-encoder';
import { MiracleTokenValidation } from './miracle-token-validator';
import { MiracleResponseFactory } from './models/factories/miracle-response.factory';
import { MiracleResponseType } from './models/miracle-response.model';

export function MiracleSecureRoute(config: { allowedUserKeys: string[] }) {
  return async (request: Request) => {
    if (!request.headers.authorization) {
      throw new HttpException(
        HttpStatus.BAD_REQUEST,
        MiracleResponseFactory.error({
          type: MiracleResponseType.CONSUMER,
          propagate: true,
          httpStatus: HttpStatus.BAD_REQUEST,
          message: 'Missing header `authorization`.',
        }),
      );
    }
    let token: MiracleToken;
    try {
      token = MiracleTokenEncoding.decode(request.headers.authorization);
    } catch (e) {
      throw new HttpException(
        HttpStatus.UNAUTHORIZED,
        MiracleResponseFactory.error({
          type: MiracleResponseType.CONSUMER,
          propagate: true,
          httpStatus: HttpStatus.UNAUTHORIZED,
          message: 'Bad token encoding.',
        }),
      );
    }
    try {
      MiracleTokenValidation.validate(token);
    } catch (e) {
      throw new HttpException(
        HttpStatus.UNAUTHORIZED,
        MiracleResponseFactory.error({
          type: MiracleResponseType.CONSUMER,
          propagate: true,
          httpStatus: HttpStatus.UNAUTHORIZED,
          message: 'Bad token.',
        }),
      );
    }
    if (!config.allowedUserKeys.find(e => e === token.payload.userKey)) {
      throw new HttpException(
        HttpStatus.FORBIDDEN,
        MiracleResponseFactory.error({
          type: MiracleResponseType.CONSUMER,
          propagate: true,
          httpStatus: HttpStatus.FORBIDDEN,
          message: 'This token cannot access this rout.',
        }),
      );
    }
    request.headers.miracle_token = JSON.stringify(token);
  };
}
