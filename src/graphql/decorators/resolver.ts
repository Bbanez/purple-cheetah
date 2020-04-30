import { QLResolverType, QLResolverPrototype } from '../interfaces';
import { QLArgPrototype } from '../interfaces';
import { QLResponseWrapper } from '../response-wrapper';

export function QLResolver<T>(config: {
  description?: string;
  name: string;
  type: QLResolverType;
  args: QLArgPrototype[];
  returnType: string;
  resolver: (...args: any) => Promise<T>;
}) {
  return (target: any) => {
    const resolver: QLResolverPrototype = {
      description: config.description,
      name: config.name,
      type: config.type,
      root: {
        args: config.args,
        returnType: config.returnType,
      },
      resolver: async (args: any) => {
        return await QLResponseWrapper.wrap<T>(async () => {
          const result = await config.resolver(...args);
          if (result instanceof Array) {
            return {
              edges: result,
            };
          }
          return {
            edge: result,
          };
        });
      },
    };
    target.prototype.get = resolver;
  };
}
