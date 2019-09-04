import {
  QLResolverType,
  QLResolver,
} from '../interfaces/ql-resolver.interface';
import { QLObject } from '../interfaces/ql-object.interface';
import { QLMiddleware } from '../middleware/ql.middleware';
import { QLEntry } from '../ql-entry';

export function EnableGraphQL(config: {
  uri?: string;
  entries: QLEntry[];
  graphiql: boolean;
}) {
  return (target: any) => {
    let stringObjects: string = '';
    let stringResolvers: string = '';
    let schema: string = `
      schema {
        @query
        @mutation
      }
    `;
    const rootValue: any = {};
    config.entries.forEach(entry => {
      stringObjects = stringObjects + '\n' + entry.qlObjects;

      const resolvers = entry.qlResolvers;
      if (resolvers.query) {
        stringResolvers = stringResolvers + '\n' + resolvers.query;
        schema = schema.replace(
          '@query',
          'query: ' + entry.name + 'Query\n@query',
        );
      }

      if (resolvers.mutation) {
        stringResolvers = stringResolvers + '\n' + resolvers.query;
        schema = schema.replace(
          '@mutation',
          'mutation: ' + entry.name + 'Mutation\n@mutation',
        );
      }

      entry.resolvers.forEach(e => {
        rootValue[e.name] = e.resolver;
      });
    });

    schema = schema.replace('@query', '').replace('@mutation', '');

    const fullSchema = `
      ${stringObjects}

      ${stringResolvers}

      ${schema}
    `;

    // let rootQueryString: string = '';
    // let rootMutationString: string = '';

    // if (config.resolvers) {
    //   config.resolvers.forEach(e => {
    //     rootValue[e.name] = e.resolver;
    //     switch (e.type) {
    //       case QLResolverType.QUERY:
    //         {
    //           rootQueryString =
    //             rootQueryString +
    //             `${e.name}@args: ${e.root.returnType}
    //             `;
    //           let args: string = '';
    //           if (e.root.args) {
    //             args =
    //               '(' +
    //               e.root.args
    //                 .map(arg => {
    //                   return `${arg.name}: ${arg.type}`;
    //                 })
    //                 .join(', ') +
    //               ')';
    //           }
    //           rootQueryString = rootQueryString.replace('@args', args);
    //         }
    //         break;
    //       case QLResolverType.MUTATION:
    //         {
    //           rootMutationString =
    //             rootMutationString + `${e.name}@args: ${e.root.returnType}\n`;
    //           let args: string = '';
    //           if (e.root.args) {
    //             args =
    //               '(' +
    //               e.root.args
    //                 .map(arg => {
    //                   return `${arg.name}: ${arg.type}`;
    //                 })
    //                 .join(', ') +
    //               ')';
    //           }
    //           rootMutationString = rootMutationString.replace('@args', args);
    //         }
    //         break;
    //     }
    //   });
    // }
    // let rootQuery: string = '';
    // let rootMutation: string = '';
    // if (rootQueryString !== '') {
    //   rootQuery = `
    //     type RootQuery {
    //       ${rootQueryString}
    //     }
    //   `;
    // }
    // if (rootMutationString !== '') {
    //   rootMutation = `
    //     type RootMutation {
    //       ${rootMutationString}
    //     }
    //   `;
    // }

    // if (rootMutation !== '') {
    //   schema = schema.replace('@mutation', 'mutation: RootMutation');
    // } else {
    //   schema = schema.replace('@mutation', '');
    // }
    // if (rootQuery !== '') {
    //   schema = schema.replace('@query', 'query: RootQuery');
    // } else {
    //   schema = schema.replace('@query', '');
    // }
    // const fullSchema = `
    //   ${stringObjects}

    //   ${rootQuery}

    //   ${rootMutation}

    //   ${schema}
    // `;
    console.log(fullSchema);
    if (target.prototype.middleware) {
      target.prototype.middleware = [
        ...target.prototype.middleware,
        new QLMiddleware({
          uri: config.uri,
          graphiql: config.graphiql,
          schema: fullSchema,
          rootValue,
        }),
      ];
    } else {
      target.prototype.middleware = [
        new QLMiddleware({
          uri: config.uri,
          graphiql: config.graphiql,
          schema: fullSchema,
          rootValue,
        }),
      ];
    }
  };
}
