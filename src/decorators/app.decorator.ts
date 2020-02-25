import * as express from 'express';
import * as http from 'http';
import { Middleware } from '../interfaces/middleware.interface';
import { Logger } from '../logger';
import { ExceptionHandler } from '../interfaces/exception-handler.interface';
import { IController } from '../interfaces/controller.interface';

/**
 * Main entry point for Purple Cheetah application. This decorator
 * will initialize application and expose `.listen` method
 * with which http server can be started.
 *
 * ### Example
 *
 * ```ts
 *  // app.ts
 *  @Application({
 *    port: 1280,
 *    controllers: [],
 *    middleware: [],
 *    exceptionHandlers: []
 *  })
 *  export class App {};
 * ```
 *
 * ```ts
 *  // main.ts
 *  const app = new App();
 *  app.listen()
 * ```
 */
export function Application(config: {
  /** Port on which application will be started. */
  port: number;
  /**
   * Array of Controller Objects:
   * see [Controller](/globals.html#controller) from more info.
   */
  controllers: IController[];
  /** Array of Middleware Objects:
   * see [Middleware](/interfaces/middleware.html) from more info.
   */
  middleware: Middleware[];
  /**
   * Array of Exception Handler Objects:
   * see [ExceptionHandler](/interfaces/exceptionhandler.html) from more info.
   */
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
