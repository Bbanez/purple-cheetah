import { RequestHandler, ErrorRequestHandler } from 'express';
import { buildSchema } from 'graphql';
import * as graphqlHTTP from 'express-graphql';
import { MiddlewarePrototype } from '../../interfaces';
import { Logger } from '../../logging';

export class QLMiddleware implements MiddlewarePrototype {
  uri?: string;
  logger?: Logger;
  after: boolean = false;
  handler: RequestHandler | RequestHandler[] | ErrorRequestHandler;

  constructor(config: {
    uri?: string;
    schema: string;
    rootValue: any;
    graphiql: boolean;
  }) {
    if (config.uri) {
      this.uri = config.uri;
    }
    this.handler = graphqlHTTP({
      schema: buildSchema(config.schema),
      rootValue: config.rootValue,
      graphiql: config.graphiql,
    });
  }
}
