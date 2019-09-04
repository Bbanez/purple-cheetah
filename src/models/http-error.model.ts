import { Logger } from '../logger';
import { HttpException } from './http-exception.model';
import { HttpStatus } from './http-status.model';

export interface HttpError {
  place: string;
  logger: Logger;
  occurred: (status: HttpStatus, message: any) => HttpException;
}
