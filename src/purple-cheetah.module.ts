import * as express from 'express';

import { Logger } from './logger';
import { Middleware } from './interfaces/middleware.interface';
import { ExceptionHandler } from './interfaces/exception-handler.interface';
import { ExceptionHandlerMiddleware } from './middleware/exception-handler.middleware';

export abstract class PurpleCheetah {
  protected app: express.Application;
  protected logger: Logger;
  protected controllers: any[];
  protected middleware: Middleware[];
  protected exceptionHandlers: ExceptionHandler[];

  public listen: () => void;

  private staticContentDir: string;

  constructor(config: {
    logFileLocation: string;
    staticContentDirectory: string;
  }) {
    this.logger = new Logger('App');
    Logger.filePath = config.logFileLocation;
    this.staticContentDir = config.staticContentDirectory;

    this.controllers.forEach(controller => {
      controller.initRouter();
    });

    this.initializeMiddleware(this.middleware);
    this.initializeControllers(this.controllers);
  }

  private initializeMiddleware(middleware: Middleware[]) {
    middleware.forEach(e => {
      if (e.uri) {
        if (e.handler instanceof Array) {
          e.handler.forEach(h => {
            this.app.use(e.uri, h);
          });
        } else {
          this.app.use(e.uri, e.handler);
        }
      } else {
        this.app.use(e.handler);
      }
    });
  }

  private initializeControllers(controllers: any[]) {
    this.app.use(express.static(this.staticContentDir));
    controllers.forEach(controller => {
      this.app.use(controller.baseUri, controller.router);
      this.logger.info('.controller', `[${controller.name}] mapping done.`);
    });
    this.exceptionHandlers.forEach(e => {
      this.app.use(e.handler);
      this.logger.info('.exceptionHandler', `[${e.name}] mapping done.`);
    });
    this.app.use(new ExceptionHandlerMiddleware().handler);
    this.app.use('', (request: express.Request, response: express.Response) => {
      this.logger.warn('.404', {
        path: `${request.method}: ${request.originalUrl}`,
        message: 'Endpoint does not exist.',
      });
      response.status(404).json({
        path: `${request.method}: ${request.originalUrl}`,
        message: 'Endpoint does not exist.',
      });
    });
  }
}
