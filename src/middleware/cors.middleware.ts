import * as cors from 'cors';
import { Middleware } from '../interfaces/middleware.interface';

/** Middleware for enabling CORS. */
export class CorsMiddleware implements Middleware {
  uri = '';
  handler = cors(this.options);

  constructor(private readonly options?: cors.CorsOptions) {}
}
