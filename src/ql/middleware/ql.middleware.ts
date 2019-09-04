import { Middleware } from '../../interfaces/middleware.interface';
import { RequestHandler, ErrorRequestHandler } from 'express';
import * as graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';

export class QLMiddleware implements Middleware {
  uri?: string;
  handler: RequestHandler | ErrorRequestHandler;

  constructor(config: {
    uri?: string,
    schema: string;
    rootValue: any;
    graphiql: boolean;
  }) {
    if(config.uri)  {
      this.uri = config.uri;
    }
    this.handler = graphqlHTTP({
      schema: buildSchema(config.schema),
      rootValue: config.rootValue,
      graphiql: config.graphiql,
    });
  }
}
