import { MiddlewarePrototype } from '../interfaces';
import { Middleware } from '../decorators';
import {
  Request,
  Response,
  RequestHandler,
  ErrorRequestHandler,
  NextFunction,
} from 'express';
import { Logger } from '../logging';

@Middleware({
  handler: (request: Request, response: Response, next: NextFunction) => {
    const logger = new Logger('RequestLogger');
    logger.info('', `${request.method}: ${request.url}`);
    next();
  },
})
export class RequestLoggerMiddleware implements MiddlewarePrototype {
  uri?: string;
  after: boolean;
  handler: RequestHandler | RequestHandler[] | ErrorRequestHandler;
}
