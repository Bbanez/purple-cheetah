import * as crypto from 'crypto';
import { Request } from 'express';

import { Controller } from '../../decorators/controller.decorator';
import { Post } from '../../decorators/controller-methods.decorator';
import { HttpErrorFactory } from '../../models/factories/http-error.factory';
import { AppLogger } from '../../decorators/app-logger.decorator';
import { Logger } from '../../logger';
import { HttpStatus } from '../../models/http-status.model';
import { ObjectUtility } from '../../util/object.util';
import {
  Permission,
  RoleName,
  JWTSecurity,
  JWTConfigService,
  JWT,
  JWTEncoding,
} from '../../jwt';

@Controller('/miracle/auth')
export class MiracleAuthController {
  private static services: Array<{
    name: string;
    secret: string;
    permissions: Permission[];
    url: string;
  }> = [];
  @AppLogger(MiracleAuthController)
  private logger: Logger;

  constructor(
    services: Array<{
      name: string;
      secret: string;
      permissions: Permission[];
    }>,
  ) {
    MiracleAuthController.services = JSON.parse(JSON.stringify(services));
  }

  @Post()
  async authorize(
    request: Request,
  ): Promise<{
    accessToken: string;
    services: Array<{
      name: string,
      url: string;
    }>;
  }> {
    const error = HttpErrorFactory.simple('.authorize', this.logger);
    if (!request.headers.authorization) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        'Missing header `authorization`.',
      );
    }
    if (!request.headers.authorization.startsWith('Bearer ')) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        'Bad `authorization` header schema.',
      );
    }
    let authData: {
      nonce: string;
      name: string;
      timestamp: number;
      signature: string;
    };
    try {
      authData = JSON.parse(
        Buffer.from(
          request.headers.authorization.replace('Bearer ', ''),
          'base64',
        ).toString(),
      );
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        'Invalid `authorization` header value.',
      );
    }
    try {
      ObjectUtility.compareWithSchema(
        authData,
        {
          nonce: {
            __type: 'string',
            __required: true,
          },
          name: {
            __type: 'string',
            __required: true,
          },
          timestamp: {
            __type: 'number',
            __required: true,
          },
          signature: {
            __type: 'string',
            __required: true,
          },
        },
        'header',
      );
    } catch (e) {
      throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
    }
    if (
      authData.timestamp < Date.now() - 3000 ||
      authData.timestamp > Date.now() + 3000
    ) {
      throw error.occurred(HttpStatus.FORBIDDEN, 'Timestamp is out of range.');
    }
    const service = MiracleAuthController.services.find(
      e => e.name === authData.name,
    );
    if (!service) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        'Invalid `name` was provided.',
      );
    }
    const hmac: crypto.Hmac = crypto.createHmac('sha256', service.secret);
    hmac.setEncoding('hex');
    hmac.write(authData.nonce + ';' + authData.name + ';' + authData.timestamp);
    hmac.end();
    const signature = hmac.read().toString();
    if (authData.signature !== signature) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, 'Invalid `signature`.');
    }
    const jwt: JWT = JWTSecurity.createToken(
      service.name,
      [
        {
          name: RoleName.SERVICE,
          permissions: service.permissions,
        },
      ],
      JWTConfigService.get('miracle-token-config'),
    );
    return {
      accessToken: JWTEncoding.encode(jwt),
      services: MiracleAuthController.services.map(e => {
        return {
          name: e.name,
          url: e.url,
        };
      }),
    };
  }
}
