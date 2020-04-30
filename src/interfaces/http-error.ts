import { Logger } from '../logging';
import { HttpException, HttpStatus } from './http-exception';

export interface HttpError {
  place: string;
  logger: Logger;
  occurred: (status: HttpStatus, message: any) => HttpException;
}
