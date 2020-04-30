import * as BodyParser from 'body-parser';
import { RequestHandler, ErrorRequestHandler } from 'express';
import { MiddlewarePrototype } from '../interfaces';
import { Logger } from '../logging';
import { Middleware } from '../decorators';

@Middleware({
  handler: BodyParser.json(),
})
export class BodyParserMiddleware implements MiddlewarePrototype {
  uri?: string;
  logger?: Logger;
  after: boolean;
  handler: RequestHandler | RequestHandler[] | ErrorRequestHandler;
}
