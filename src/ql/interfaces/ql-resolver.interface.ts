import { QLField } from './ql-field.interface';

export enum QLResolverType {
  QUERY = 'QUERY',
  MUTATION = 'MUTATION',
}

export interface QLResolver {
  name: string;
  type: QLResolverType,
  root: {
    args?: QLField[];
    returnType: string;
  };
  resolver: (args: any) => Promise<any>;
}
