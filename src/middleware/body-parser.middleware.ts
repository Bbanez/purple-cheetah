import * as BodyParser from 'body-parser';
import { Middleware } from '../interfaces/middleware.interface';

export class BodyParserMiddleware implements Middleware {
  uri: string = '';
  handler = BodyParser.json();
}
