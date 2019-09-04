import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { HiveEventDataFactory } from '../models/factories/hive-event-data.factory';
import { HiveEventName } from '../models/hive-event-name.enum';
import { HiveConnectionService } from '../hive-connection.service';
import { HiveAuth } from '../hive-auth.util';
import { ExceptionHandler } from '../../interfaces/exception-handler.interface';
import { HiveRequestLogBufferService } from '../hive-request-log-buffer.service';
import { IHiveRequestLog } from '../interfaces/hive-request-log.interface';

export class HiveServerHttpExceptionHandler implements ExceptionHandler {
  name: string = 'HiveServerHttpExceptionHandler';
  handler: ErrorRequestHandler = (
    error: any,
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    if (error) {
      const data = HiveEventDataFactory.instance;
      const logObject: IHiveRequestLog = {
        gateway: {
          nonce: '',
        },
        response: {},
      };
      if (typeof error.message === 'object') {
        logObject.response.body = Buffer.from(
          JSON.stringify(error.message),
        ).toString('base64');
      } else {
        logObject.response.body = Buffer.from(error.message).toString('base64');
      }
      if (request.headers.request_nonce) {
        logObject.gateway.nonce = '' + request.headers.request_nonce;
      }
      if (error instanceof Error) {
        logObject.response.stack = Buffer.from(error.stack).toString('base64');
      }
      data.payload = logObject;
      HiveRequestLogBufferService.add(logObject);
      HiveConnectionService.findAll().forEach(connection => {
        if (
          connection.user.allowedEventNames.find(
            e => e === HiveEventName.LOG_SUBSCRIBE,
          )
        ) {
          data.signature = HiveAuth.sign(data, connection.user);
          connection.socket.emit(HiveEventName.LOG_SUBSCRIBE, data);
        }
      });
    }
    next(error);
  };
}
