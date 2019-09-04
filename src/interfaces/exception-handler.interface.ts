import { ErrorRequestHandler } from 'express';

export interface ExceptionHandler {
  name: string;
  handler: ErrorRequestHandler;
}
