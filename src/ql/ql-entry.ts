import { QLObject } from './interfaces/ql-object.interface';
import { QLResolver } from './interfaces/ql-resolver.interface';
import { QLResolverType } from '.';

export abstract class QLEntry {
  abstract name: string;
  abstract objects: QLObject[];
  abstract resolvers: QLResolver[];

  public get qlObjects(): string {
    return this.objects
      .map(e => {
        return `
          type ${e.name} {
            ${e.fields
              .map(field => {
                return `${field.name}: ${field.type}`;
              })
              .join('\n')}
          }
        `;
      })
      .join('\n');
  }

  public get qlResolvers(): {
    query?: string;
    mutation?: string;
  } {
    let rootQueryString: string = '';
    let rootMutationString: string = '';
    const rootValue: any = {};

    this.resolvers.forEach(e => {
      rootValue[e.name] = e.resolver;
      switch (e.type) {
        case QLResolverType.QUERY:
          {
            rootQueryString =
              rootQueryString +
              `${e.name}@args: ${e.root.returnType}
              `;
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
            rootMutationString =
              rootMutationString + `${e.name}@args: ${e.root.returnType}\n`;
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
    const result: {
      query?: string;
      mutation?: string;
    } = {};
    if (rootQueryString !== '') {
      result.query = `
        type ${this.name}Query {
          ${rootQueryString}
        }
      `;
    }
    if (rootMutationString !== '') {
      result.mutation = `
        type ${this.name}Mutation {
          ${rootMutationString}
        }
      `;
    }
    return result;
  }
}
