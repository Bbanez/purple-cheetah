import { Request } from 'express';
import * as crypto from 'crypto';

import { Controller } from '../../decorators/controller.decorator';
import { AppLogger } from '../../decorators/app-logger.decorator';
import { Logger } from '../../logger';
import { MiracleUserService } from './services/miracle-user.service';
import { Service } from '../../decorators/service.decorator';
import { Post } from '../../decorators/controller-methods.decorator';
import { HttpErrorFactory } from '../../models/factories/http-error.factory';
import { HttpStatus } from '../../models/http-status.model';
import { MiracleTokenEncoding } from './miracle-token-encoder';
import { MiracleTokenFactory } from './models/factories/miracle-token.factory';
import {
  MiracleResponse,
  MiracleResponseType,
} from './models/miracle-response.model';
import { MiracleResponseFactory } from './models/factories/miracle-response.factory';

@Controller('/auth')
export class MiracleAuthController {
  @AppLogger(MiracleUserService)
  private logger: Logger;
  @Service(MiracleUserService)
  private miracleUserService: MiracleUserService;

  @Post('/client')
  async getToken(request: Request): Promise<MiracleResponse> {
    const error = HttpErrorFactory.simple('.getTokens', this.logger);
    if (!request.headers.authorization) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        MiracleResponseFactory.error({
          type: MiracleResponseType.CONSUMER,
          propagate: true,
          httpStatus: HttpStatus.BAD_REQUEST,
          message: 'Missing header `authorization`.',
        }),
      );
    }
    if (request.headers.authorization.startsWith('Bearer ') === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        MiracleResponseFactory.error({
          type: MiracleResponseType.CONSUMER,
          propagate: true,
          httpStatus: HttpStatus.BAD_REQUEST,
          message: 'Bad header `authorization` schema.',
        }),
      );
    }
    const data = {
      key: '',
      timestamp: 0,
      signature: '',
    };
    try {
      const parts: string[] = Buffer.from(
        request.headers.authorization.replace('Bearer ', ''),
        'base64',
      )
        .toString('utf8')
        .split(',');
      data.key = parts[0];
      data.timestamp = parseInt(parts[1], 10);
      data.signature = parts[2];
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        MiracleResponseFactory.error({
          type: MiracleResponseType.CONSUMER,
          propagate: true,
          httpStatus: HttpStatus.BAD_REQUEST,
          message: 'Bad header `authorization` format.',
        }),
      );
    }
    if (
      data.timestamp < Date.now() - 3000 ||
      data.timestamp > Date.now() + 3000
    ) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        MiracleResponseFactory.error({
          type: MiracleResponseType.CONSUMER,
          propagate: true,
          httpStatus: HttpStatus.FORBIDDEN,
          message: 'Invalid timestamp.',
        }),
      );
    }
    const user = await this.miracleUserService.findByKey(data.key);
    if (user === null) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        MiracleResponseFactory.error({
          type: MiracleResponseType.CONSUMER,
          propagate: true,
          httpStatus: HttpStatus.UNAUTHORIZED,
          message: 'User does not exist.',
        }),
      );
    }
    const hmac = crypto.createHmac('sha256', user.secret);
    hmac.setEncoding('hex');
    hmac.write(user.key + data.timestamp);
    hmac.end();
    const checkSignature = hmac.read().toString();
    if (checkSignature !== data.signature) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        MiracleResponseFactory.error({
          type: MiracleResponseType.CONSUMER,
          propagate: true,
          httpStatus: HttpStatus.UNAUTHORIZED,
          message: 'Bad signature.',
        }),
      );
    }
    return MiracleResponseFactory.success({
      access_token: MiracleTokenEncoding.encode(
        MiracleTokenFactory.create(user),
      ),
    });
  }
}
