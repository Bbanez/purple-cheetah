import { RequestHandler, ErrorRequestHandler } from 'express';

export interface Middleware {
  uri?: string;
  handler: RequestHandler | RequestHandler[] | ErrorRequestHandler;
}
