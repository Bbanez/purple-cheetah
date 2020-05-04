import { QLFieldPrototype } from './ql-field-prototype';

export interface QLObjectPrototype {
  name: string;
  type?: string;
  fields: QLFieldPrototype[];
  description?: string;
  wrapperObject?: QLObjectPrototype;
}
