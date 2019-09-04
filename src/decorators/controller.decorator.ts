import { Router } from 'express';

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
