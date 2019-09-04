import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { HiveEventDataFactory } from '../models/factories/hive-event-data.factory';
import { HiveClient } from '../hive.client';
import { HiveEventName } from '../models/hive-event-name.enum';
import { ExceptionHandler } from '../../interfaces/exception-handler.interface';

export class HiveHttpExceptionHandler implements ExceptionHandler {
  name: string = 'HiveHttpExceptionHandler';
  handler: ErrorRequestHandler = (
    error: any,
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    if (error) {
      const data = HiveEventDataFactory.instance;
      if (typeof error.message === 'object') {
        data.payload.response = {
          body: Buffer.from(JSON.stringify(error.message)).toString('base64'),
        };
      } else {
        data.payload.response = {
          body: Buffer.from(error.message).toString('base64'),
        };
      }
      if (request.headers.request_nonce) {
        data.payload.nonce = request.headers.request_nonce;
      }
      if (error instanceof Error) {
        data.payload.response.stack = Buffer.from(error.stack).toString(
          'base64',
        );
      }
      HiveClient.send(HiveEventName.HTTP_REQUEST_ERROR, data);
    }
    next(error);
  };
}
