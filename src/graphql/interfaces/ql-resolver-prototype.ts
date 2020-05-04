import { QLArgPrototype } from './ql-arg-prototype';
import { QLResponse } from './ql-response';

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
  resolver: (args: any) => Promise<QLResponse<any>>;
  description?: string;
}
