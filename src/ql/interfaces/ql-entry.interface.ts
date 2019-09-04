import { QLObject } from './ql-object.interface';
import { QLResolver } from './ql-resolver.interface';

export interface QLEntry {
  name: string;
  objects?: QLObject[];
  resolvers?: QLResolver[];
}
