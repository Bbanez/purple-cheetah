import { Logger } from '../../logger';
import { HttpError } from '../http-error.model';
import { HttpStatus } from '../http-status.model';
import { HttpException } from '../http-exception.model';

/**
 * Factory for creating new instance of Http Exception.
 */
export class HttpErrorFactory {
  public static simple(place: string, logger: Logger): HttpError {
    return {
      place,
      logger,
      occurred: (status: HttpStatus, message: any): HttpException => {
        logger.warn(place, message);
        return new HttpException(status, message);
      },
    };
  }
}
