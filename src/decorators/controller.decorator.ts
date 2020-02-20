import { Router } from 'express';

/**
 * Decorator that will annotate a Class as a Controller
 * width all required properties. Class annotated
 * with Controller decoration can parsed as a new instance
 * to [Application](/globals.html#application) decorator.
 *
 * ### Example
 *
 * ```ts
 *  // my-controller.ts
 *  @Controller('/my-controller')
 *  export class MyController {
 *    @Get()
 *    async getMethod() {
 *      return 'This is my controller.'
 *    }
 *  }
 * ```
 *
 * ```ts
 *  //app.ts
 *  @Application({
 *    port: 1280,
 *    controllers: [ new MyController() ],
 *    middleware: [],
 *    exceptionHandlers: []
 *  })
 *  export class App {};
 * ```
 *
 * After starting the application route `GET: /my-controller`
 * will be exposed. See [Controller Methods]() for more information
 * about `Get` decorator.
 */
export function Controller(uri?: string) {
  return (target: any) => {
    target.prototype.name = target.name;
    target.prototype.baseUri = '';
    if (uri) {
      target.prototype.baseUri = uri;
    }
    target.prototype.router = Router();
    target.prototype.initRouter = () => {
      target.prototype.endpoints.forEach(endpoint => {
        target.prototype.router[endpoint.method](
          endpoint.uri,
          endpoint.handler,
        );
      });
    };
  };
}
