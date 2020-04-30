import { MiddlewarePrototype } from '../interfaces';
import { Middleware } from '../decorators';
import {
  RequestHandler,
  ErrorRequestHandler,
  Request,
  Response,
} from 'express';

@Middleware({
  after: true,
  handler: (request: Request, response: Response) => {
    this.logger.warn('.404', {
      path: `${request.method}: ${request.originalUrl}`,
      message: 'Endpoint does not exist.',
    });
    response.status(404).json({
      path: `${request.method}: ${request.originalUrl}`,
      message: 'Endpoint does not exist.',
    });
  },
})
export class NotFoundMiddleware implements MiddlewarePrototype {
  uri?: string;
  after: boolean;
  handler: RequestHandler | RequestHandler[] | ErrorRequestHandler;
}
