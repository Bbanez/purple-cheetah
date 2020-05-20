import { Controller, Post, Get } from '../../decorators';
import { CreateLogger, Logger } from '../../logging';
import { Request } from 'express';
import { MiracleRegistry, MiracleRequestSchema } from '../interfaces';
import { HttpErrorFactory } from '../../factories';
import { HttpStatus } from '../../interfaces';
import { ObjectUtility } from '../../util';
import { MiracleSecurity } from '../security';
import { MiracleRegistryServerCache } from '../cache';

@Controller('/miracle/registry')
export class MiracleRegistryController {
  @CreateLogger(MiracleRegistryController)
  private logger: Logger;
  private static security: MiracleSecurity;

  public static initSecurity(security: MiracleSecurity) {
    MiracleRegistryController.security = security;
  }

  @Get('')
  async registry(request: Request): Promise<{ registry: any }> {
    // const error = HttpErrorFactory.instance('.stats', this.logger);
    // try {
    //   ObjectUtility.compareWithSchema(
    //     request.body,
    //     MiracleRequestSchema,
    //     'body',
    //   );
    // } catch (e) {
    //   throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
    // }
    return {
      registry: MiracleRegistryServerCache.findAll(),
    };
  }

  @Post('/register')
  async register(request: Request): Promise<{ registry: MiracleRegistry[] }> {
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
    let payload: {
      name: string;
      origin: string;
      ssl: boolean;
      heartbeat: string;
      stats: {
        cpu: number;
        ram: number;
        lastCheck: number;
      };
    };
    try {
      payload = MiracleRegistryController.security.process(request.body);
    } catch (e) {
      throw error.occurred(HttpStatus.FORBIDDEN, e.message);
    }
    try {
      ObjectUtility.compareWithSchema(
        payload,
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
          stats: {
            __type: 'object',
            __required: true,
            __child: {
              cpu: {
                __type: 'number',
                __required: true,
              },
              ram: {
                __type: 'number',
                __required: true,
              },
              lastCheck: {
                __type: 'number',
                __required: true,
              },
            },
          },
        },
        'body.payload',
      );
    } catch (e) {
      throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
    }
    MiracleRegistryServerCache.add({
      name: payload.name,
      heartbeat: payload.heartbeat,
      origin: payload.origin,
      ssl: payload.ssl,
      stats: payload.stats,
    });
    return { registry: MiracleRegistryServerCache.findAll() };
  }
}
