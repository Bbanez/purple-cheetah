import { Middleware } from '../interfaces/middleware.interface';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import { Logger } from '../logger';

export class RequestLoggerMiddleware implements Middleware {
  private logger = new Logger('RequestLoggerMiddleware');
  uri: string = '';
  handler: RequestHandler = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    this.logger.info('.filter', `${request.method}: ${request.originalUrl}`);
    next();
  }
}
