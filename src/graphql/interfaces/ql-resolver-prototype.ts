import { QLArgPrototype } from './ql-arg-prototype';

export enum QLResolverType {
  QUERY = 'QUERY',
  MUTATION = 'MUTATION',
}

export interface QLResolverPrototype {
  name: string;
  type: QLResolverType;
  root: {
    args?: QLArgPrototype[];
    returnType: string;
  };
  resolver: (args: any) => Promise<any>;
  description?: string;
}
