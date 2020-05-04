import {
  QLObjectPrototype,
  QLInputPrototype,
  QLResolverPrototype,
} from './interfaces';

export class QLEntryBuffer {
  public static graphQLConfig: {
    use: boolean;
    config?: {
      uri: string;
      graphiql: boolean;
      schema: string;
      rootValue: string;
    };
  } = {
    use: false,
  };
  public static objects: QLObjectPrototype[] = [];
  public static inputs: QLInputPrototype[] = [];
  public static resolvers: QLResolverPrototype[] = [];

  public static addObject(object: QLObjectPrototype) {
    this.objects.push(object);
  }

  public static addInput(input: QLInputPrototype) {
    this.inputs.push(input);
  }

  public static addResolver(resolver: QLResolverPrototype) {
    this.resolvers.push(resolver);
  }
}
