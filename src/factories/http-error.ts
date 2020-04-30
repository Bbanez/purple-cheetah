import { Logger } from '../logging';
import { HttpError, HttpStatus, HttpException } from '../interfaces';

export class HttpErrorFactory {
  public static instance(place: string, logger: Logger): HttpError {
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
