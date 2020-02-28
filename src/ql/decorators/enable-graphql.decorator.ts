import {
  QLResolverType,
  QLResolver,
} from '../interfaces/ql-resolver.interface';
import { QLObject } from '../interfaces/ql-object.interface';
import { QLMiddleware } from '../middleware/ql.middleware';
import { QLInput } from '../interfaces/ql-input.interface';

export function EnableGraphQL(config: {
  uri?: string;
  rootName: string;
  objects?: QLObject[];
  inputs?: QLInput[];
  resolvers?: QLResolver[];
  graphiql: boolean;
}) {
  return (target: any) => {
    let stringObjects: string = '';
    if (config.objects) {
      stringObjects = [
        `
        type ResponseError {
          status: Int!
          message: String!
          payloadBase64: String
        }
        `,
        ...config.objects.map(e => {
          if (e.description) {
            return `
              """
              ${e.description}
              """
              type ${e.name} {
                ${e.fields
                  .map(field => {
                    if (field.description) {
                      return `
                        "${field.description}"
                        ${field.name}: ${field.type}
                      `;
                    } else {
                      return `${field.name}: ${field.type}`;
                    }
                  })
                  .join('\n')}
              }
            `;
          } else {
            return `
              type ${e.name} {
                ${e.fields
                  .map(field => {
                    if (field.description) {
                      return `${field.description}\n${field.name}: ${field.type}`;
                    } else {
                      return `${field.name}: ${field.type}`;
                    }
                  })
                  .join('\n')}
              }
            `;
          }
        }),
      ].join('\n');
    }

    let stringInputs: string = '';
    if (config.inputs) {
      stringInputs = config.inputs
        .map(e => {
          if (e.description) {
            return `
              """
              ${e.description}
              """
              input ${e.name} {
                ${e.fields
                  .map(field => {
                    if (field.description) {
                      return `
                        "${field.description}"
                        ${field.name}: ${field.type}
                      `;
                    } else {
                      return `${field.name}: ${field.type}`;
                    }
                  })
                  .join('\n')}
              }
            `;
          } else {
            return `
              input ${e.name} {
                ${e.fields
                  .map(field => {
                    if (field.description) {
                      return `${field.description}\n${field.name}: ${field.type}`;
                    } else {
                      return `${field.name}: ${field.type}`;
                    }
                  })
                  .join('\n')}
              }
            `;
          }
        })
        .join('\n');
    }

    let rootQueryString: string = '';
    let rootMutationString: string = '';
    const rootValue: any = {};

    if (config.resolvers) {
      config.resolvers.forEach(e => {
        rootValue[e.name] = e.resolver;
        switch (e.type) {
          case QLResolverType.QUERY:
            {
              if (e.description) {
                rootQueryString =
                  rootQueryString +
                  `"""
                  ${e.description}
                  """
                ${e.name}@args: ${e.root.returnType}
                `;
              } else {
                rootQueryString =
                  rootQueryString +
                  `${e.name}@args: ${e.root.returnType}
                `;
              }
              let args: string = '';
              if (e.root.args) {
                args =
                  '(' +
                  e.root.args
                    .map(arg => {
                      return `${arg.name}: ${arg.type}`;
                    })
                    .join(', ') +
                  ')';
              }
              rootQueryString = rootQueryString.replace('@args', args);
            }
            break;
          case QLResolverType.MUTATION:
            {
              if (e.description) {
                rootMutationString =
                  rootMutationString +
                  `"""
                  ${e.description}
                  """
                ${e.name}@args: ${e.root.returnType}\n`;
              } else {
                rootMutationString =
                  rootMutationString + `${e.name}@args: ${e.root.returnType}\n`;
              }
              let args: string = '';
              if (e.root.args) {
                args =
                  '(' +
                  e.root.args
                    .map(arg => {
                      return `${arg.name}: ${arg.type}`;
                    })
                    .join(', ') +
                  ')';
              }
              rootMutationString = rootMutationString.replace('@args', args);
            }
            break;
        }
      });
    }
    let rootQuery: string = '';
    let rootMutation: string = '';
    if (rootQueryString !== '') {
      rootQuery = `
        """
        Root Query for ${config.rootName}
        """
        type ${config.rootName}Query {
          ${rootQueryString}
        }
      `;
    }
    if (rootMutationString !== '') {
      rootMutation = `
        """
        Root Mutation for ${config.rootName}
        """
        type ${config.rootName}Mutation {
          ${rootMutationString}
        }
      `;
    }
    let schema: string = `
      schema {
        @query
        @mutation
      }
    `;
    if (rootMutation !== '') {
      schema = schema.replace(
        '@mutation',
        `mutation: ${config.rootName}Mutation`,
      );
    } else {
      schema = schema.replace('@mutation', '');
    }
    if (rootQuery !== '') {
      schema = schema.replace('@query', `query: ${config.rootName}Query`);
    } else {
      schema = schema.replace('@query', '');
    }
    const fullSchema = `
      ${stringObjects}

      ${stringInputs}

      ${rootQuery}

      ${rootMutation}

      ${schema}
    `;
    // console.log(fullSchema);
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
