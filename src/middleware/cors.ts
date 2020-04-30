import * as cors from 'cors';
import { MiddlewarePrototype } from '../interfaces';
import { ErrorRequestHandler, RequestHandler } from 'express';
import { Logger } from '../logging';

export class CORSMiddleware implements MiddlewarePrototype {
  uri?: string;
  logger?: Logger;
  after: boolean = false;
  handler: RequestHandler | RequestHandler[] | ErrorRequestHandler;

  constructor(options?: cors.CorsOptions) {
    this.handler = cors(options);
  }
}
