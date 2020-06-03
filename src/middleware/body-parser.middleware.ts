import * as BodyParser from 'body-parser';
import { Middleware } from '../interfaces/middleware.interface';

/**
 * Middleware for parsing request body to a JSON format.
 */
export class BodyParserMiddleware implements Middleware {
  uri: string = '';
  handler;

  constructor(options?: BodyParser.OptionsJson) {
    this.handler = BodyParser.json(options);
  }
}
