import { Request, Response } from 'express';

interface RouteMethodOptions {
  security?: {
    throwableFunctions?: Array<(request: Request) => Promise<void>>;
  };
}

export function Get(uri?: string, options?: RouteMethodOptions) {
  return (
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    return build('get', target, key, descriptor, uri, options);
  };
}

export function Post(uri?: string, options?: RouteMethodOptions) {
  return (
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    return build('post', target, key, descriptor, uri, options);
  };
}

export function Put(uri?: string, options?: RouteMethodOptions) {
  return (
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    return build('put', target, key, descriptor, uri, options);
  };
}

export function Delete(uri?: string, options?: RouteMethodOptions) {
  return (
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    return build('delete', target, key, descriptor, uri, options);
  };
}

function build(
  method: string,
  target: any,
  key: string | symbol,
  descriptor: PropertyDescriptor,
  uri?: string,
  options?: RouteMethodOptions,
): PropertyDescriptor {
  let baseUri: string = '';
  if (uri) {
    baseUri = uri;
  }
  if (!target.endpoints) {
    target.endpoints = [];
  }
  const original = descriptor.value;
  descriptor.value = async (...args: any[]) => {
    try {
      if (options && options.security) {
        if (options.security.throwableFunctions) {
          for (const i in options.security.throwableFunctions) {
            if (options.security.throwableFunctions[i]) {
              await options.security.throwableFunctions[i](args[0]);
            }
          }
        }
      }
      const result = await original.apply(target, args);
      if (result instanceof Buffer) {
        args[0].res.send(result);
      } else if (typeof result === 'object') {
        args[0].res.json(result);
      } else {
        if (result) {
          args[0].res.status(200);
          args[0].res.send(result);
          args[0].res.end();
        }
      }
    } catch (e) {
      args[0].next(e);
    }
  };
  target.endpoints = [
    ...target.endpoints,
    {
      uri: baseUri,
      method,
      handler: descriptor.value,
    },
  ];
  return descriptor;
}
