import * as express from 'express';

import { Logger } from './logging';
import { MiddlewarePrototype } from './interfaces';
import { ControllerPrototype } from './interfaces';

export abstract class PurpleCheetah {
  protected app: express.Application;
  protected logger: Logger;
  protected controllers: ControllerPrototype[];
  protected middleware: MiddlewarePrototype[];

  public listen: () => void;

  private staticContentDir: string;

  constructor(config: {
    logFileLocation: string;
    staticContentDirectory: string;
  }) {
    Logger.setLogPath(config.logFileLocation);
    this.staticContentDir = config.staticContentDirectory;

    this.controllers.forEach((controller) => {
      controller.initRouter();
    });

    this.initializeMiddleware(this.middleware, false);
    this.initializeControllers(this.controllers);
    this.initializeMiddleware(this.middleware, true);
  }

  private initializeMiddleware(
    middleware: MiddlewarePrototype[],
    after: boolean,
  ) {
    middleware.forEach((e) => {
      if (e.after === after) {
        if (e.uri) {
          if (e.handler instanceof Array) {
            e.handler.forEach((h) => {
              this.app.use(e.uri, h);
            });
          } else {
            this.app.use(e.uri, e.handler);
          }
        } else {
          this.app.use(e.handler);
        }
      }
    });
  }

  private initializeControllers(controllers: any[]) {
    this.app.use(express.static(this.staticContentDir));
    controllers.forEach((controller) => {
      this.app.use(controller.baseUri, controller.router);
      this.logger.info('.controller', `[${controller.name}] mapping done.`);
    });
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
