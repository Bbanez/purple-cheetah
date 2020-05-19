import * as express from 'express';
import * as http from 'http';
import { Logger } from '../logging';
import { MiddlewarePrototype, ControllerPrototype } from '../interfaces';
import {
  NotFoundMiddleware,
  HttpExceptionHandlerMiddleware,
  RequestLoggerMiddleware,
} from '../middleware';

export function Application(config: {
  port: number;
  controllers: ControllerPrototype[];
  middleware: MiddlewarePrototype[];
  requestLoggerMiddleware?: MiddlewarePrototype;
  notFoundMiddleware?: MiddlewarePrototype;
  httpExceptionHandlerMiddleware?: MiddlewarePrototype;
}) {
  return (target: any) => {
    target.prototype.logger = new Logger('PurpleCheetah');
    target.prototype.app = express();
    target.prototype.server = http.createServer(target.prototype.app);
    target.prototype.queue = [];
    if (target.prototype.controllers) {
      target.prototype.controllers = [
        ...target.prototype.controllers,
        ...config.controllers,
      ];
    } else {
      target.prototype.controllers = config.controllers;
    }
    if (!target.prototype.middleware) {
      target.prototype.middleware = [];
    }
    if (config.requestLoggerMiddleware) {
      config.requestLoggerMiddleware.after = false;
      target.prototype.middleware.push(config.requestLoggerMiddleware);
    } else {
      target.prototype.middleware.push(new RequestLoggerMiddleware());
    }
    target.prototype.middleware = [
      ...target.prototype.middleware,
      ...config.middleware,
    ];
    if (config.httpExceptionHandlerMiddleware) {
      config.httpExceptionHandlerMiddleware.after = true;
      target.prototype.middleware.push(config.httpExceptionHandlerMiddleware);
    } else {
      target.prototype.middleware.push(new HttpExceptionHandlerMiddleware());
    }
    if (config.notFoundMiddleware) {
      config.notFoundMiddleware.after = true;
      target.prototype.middleware.push(config.notFoundMiddleware);
    } else {
      target.prototype.middleware.push(new NotFoundMiddleware());
    }
    target.prototype.port = config.port;

    target.prototype.listen = () => {
      target.prototype.server.listen(target.prototype.port, (error: Error) => {
        if (error) {
          target.prototype.logger.error('.listen', '' + error.stack);
          return;
        }
        target.prototype.logger.info(
          '.listen',
          `Server started on port ${target.prototype.port}.`,
        );
      });
    };
  };
}
