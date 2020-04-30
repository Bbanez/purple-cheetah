import { RequestHandler, ErrorRequestHandler } from 'express';
import { Logger } from '../logging';

export interface MiddlewarePrototype {
  uri?: string;
  logger?: Logger;
  after: boolean;
  handler: RequestHandler | RequestHandler[] | ErrorRequestHandler;
}
