import { CreateLogger, Logger } from '../../logging';
import { Controller, Post } from '../../decorators';
import { Request, Router } from 'express';
import { HttpErrorFactory } from '../../factories';
import { ObjectUtility } from '../../util';
import { MiracleRequestSchema } from '../interfaces';
import { MiracleSecurity } from '../security';
import { HttpStatus, ControllerPrototype } from '../../interfaces';
import * as osu from 'node-os-utils';

@Controller('/miracle/heartbeat')
export class MiracleHeartbeatController implements ControllerPrototype {
  @CreateLogger(MiracleHeartbeatController)
  logger: Logger;
  name: string;
  baseUri: string;
  router: Router;
  initRouter: () => void;

  constructor(private security: MiracleSecurity) {}

  @Post()
  async heartbeat(
    request: Request,
  ): Promise<{
    stats: {
      cpu: number;
      ram: number;
      lastCheck: number;
    };
  }> {
    const error = HttpErrorFactory.instance('.heartbeat', this.logger);
    try {
      ObjectUtility.compareWithSchema(
        request.body,
        MiracleRequestSchema,
        'body',
      );
    } catch (e) {
      throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
    }
    try {
      this.security.process(request.body);
    } catch (e) {
      throw error.occurred(HttpStatus.FORBIDDEN, e.message);
    }
    return {
      stats: {
        cpu: await osu.cpu.usage(),
        ram: (await osu.mem.used()).usedMemMb / 1024,
        lastCheck: Date.now(),
      },
    };
  }
}
