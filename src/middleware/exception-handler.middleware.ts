import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../models/http-exception.model';
import { Middleware } from '../interfaces/middleware.interface';
import { Logger } from '../logger';
import { AppLogger } from '../decorators/app-logger.decorator';

/**
 * Middleware for handling exception of type HttpException.
 * Enabled by default in every Purple Cheetah application.
 */
export class ExceptionHandlerMiddleware implements Middleware {
  @AppLogger(ExceptionHandlerMiddleware)
  private static logger: Logger;

  handler(
    error: any,
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
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
        if (!ExceptionHandlerMiddleware.logger) {
          ExceptionHandlerMiddleware.logger = new Logger('ExceptionHandler');
        }
        ExceptionHandlerMiddleware.logger.error('.unknown', error);
        response.status(500).json({
          message: 'Unknown exception.',
        });
      }
    }
  }
}
