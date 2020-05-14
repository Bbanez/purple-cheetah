import { Controller, Post } from '../../decorators';
import { CreateLogger, Logger } from '../../logging';
import { Request } from 'express';
import { MiracleRegistry, MiracleRequestSchema } from '../interfaces';
import { HttpErrorFactory } from 'src/factories';
import { HttpStatus } from 'src/interfaces';
import { ObjectUtility } from 'src/util';
import { MiracleSecurity } from '../security';

@Controller('/miracle/registry')
export class MiracleRegistryController {
  @CreateLogger(MiracleRegistryController)
  private logger: Logger;

  constructor(private security: MiracleSecurity) {}

  @Post('/register')
  async register(request: Request): Promise<MiracleRegistry> {
    const error = HttpErrorFactory.instance('.register', this.logger);
    try {
      ObjectUtility.compareWithSchema(
        request.body,
        MiracleRequestSchema,
        'body',
      );
    } catch (e) {
      throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
    }
    let body: {
      name: string;
      origin: string;
      ssl: boolean;
      heartbeat: string;
    };
    try {
      body = this.security.process(request.body);
    } catch (e) {
      throw error.occurred(HttpStatus.FORBIDDEN, e.message);
    }
    try {
      ObjectUtility.compareWithSchema(
        body,
        {
          name: {
            __type: 'string',
            __required: true,
          },
          origin: {
            __type: 'string',
            __required: true,
          },
          ssl: {
            __type: 'boolean',
            __required: true,
          },
          heartbeat: {
            __type: 'string',
            __required: true,
          },
        },
        'body.payload',
      );
    } catch (e) {
      throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
    }
    
  }
}
