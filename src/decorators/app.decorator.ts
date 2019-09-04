import * as express from 'express';
import * as http from 'http';
import { Middleware } from '../interfaces/middleware.interface';
import { Logger } from '../logger';
import { ExceptionHandler } from '../interfaces/exception-handler.interface';

export function Application(config: {
  port: number;
  controllers: any[];
  middleware: Middleware[];
  exceptionHandlers: ExceptionHandler[];
}) {
  return (target: any) => {
    const logger: Logger = new Logger('App');
    target.prototype.app = express();
    target.prototype.server = http.createServer(target.prototype.app);
    if (target.prototype.controllers) {
      target.prototype.controllers = [
        ...target.prototype.controllers,
        ...config.controllers,
      ];
    } else {
      target.prototype.controllers = config.controllers;
    }
    if (target.prototype.middleware) {
      target.prototype.middleware = [
        ...target.prototype.middleware,
        ...config.middleware,
      ];
    } else {
      target.prototype.middleware = config.middleware;
    }
    if (target.prototype.exceptionHandlers) {
      target.prototype.exceptionHandlers = [
        ...target.prototype.exceptionHandlers,
        ...config.exceptionHandlers,
      ];
    } else {
      target.prototype.exceptionHandlers = config.exceptionHandlers;
    }
    target.prototype.port = config.port;

    target.prototype.listen = () => {
      target.prototype.server.listen(target.prototype.port, (error: Error) => {
        if (error) {
          // tslint:disable-next-line: no-console
          logger.error('.listen', '' + error.stack);
          return;
        }
        // tslint:disable-next-line: no-console
        logger.info(
          '.listen',
          `Server started on port ${target.prototype.port}.`,
        );
      });
    };
  };
}
