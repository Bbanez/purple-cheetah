import * as crypto from 'crypto';
import { Controller, Post } from '../../decorators';
import { Request } from 'express';
import { CreateLogger, Logger } from '../../logging';
import { HttpErrorFactory } from '../../factories';
import { ObjectUtility } from '../../util';
import { HttpStatus } from '../../interfaces';

@Controller('/miracle/key-store')
export class MiracleKeyStoreController {
  @CreateLogger(MiracleKeyStoreController)
  private logger: Logger;

  @Post('/auth')
  async auth(request: Request) {
    const error = HttpErrorFactory.instance('auth', this.logger);
    try {
      ObjectUtility.compareWithSchema(request.body, {
        nonce: {
          __type: 'string',
          __required: true,
        },
        timestamp: {
          __type: 'number',
          __required: true,
        },
        key: {
          __type: 'string',
          __required: true,
        },
        signature: {
          __type: 'string',
          __required: true,
        },
      });
    } catch (e) {
      throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
    }
    if (
      request.body.timestamp < Date.now() - 3000 ||
      request.body.timestamp > Date.now() + 1000
    ) {
      throw error.occurred(HttpStatus.FORBIDDEN, 'Timestamp is out of range.');
    }
    const config = MiracleKeyStoreConfigCache.get();
    const service = config.services.find((e) => e.key === request.body.key);
    if (!service) {
      throw error.occurred(HttpStatus.FORBIDDEN, 'Invalid key was provided.');
    }
    const checkSignature = crypto
      .createHmac('sha-256', service.secret)
      .update(request.body.timestamp + request.body.nonce + service.key)
      .digest()
      .toString('hex');
    if (checkSignature !== request.body.signature) {
      throw error.occurred(HttpStatus.FORBIDDEN, 'Invalid signature.');
    }
    return MiracleKeyStoreConfigCache.byKey(service.key);
  }
}
