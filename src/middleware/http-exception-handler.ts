import {
  RequestHandler,
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';
import { Logger } from '../logging';
import { MiddlewarePrototype, HttpException } from '../interfaces';
import { Middleware } from '../decorators';

@Middleware({
  after: true,
  handler: async (
    error: any,
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    if (!error) {
      next();
    } else {
      if (error instanceof HttpException) {
        if (typeof error.message === 'object') {
          response.status(error.status).json(error.message);
        } else {
          response.status(error.status).json({
            message: error.message,
          });
        }
      } else {
        const logger = new Logger('ExceptionHandler');
        logger.error('.unknown', error);
        response.status(500).json({
          message: 'Unknown exception.',
        });
      }
    }
  },
})
export class HttpExceptionHandlerMiddleware implements MiddlewarePrototype {
  uri?: string;
  after: boolean;
  handler: RequestHandler | RequestHandler[] | ErrorRequestHandler;
}
