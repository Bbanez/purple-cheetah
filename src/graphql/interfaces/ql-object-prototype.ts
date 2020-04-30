import { QLFieldPrototype } from './ql-field-prototype';

export interface QLObjectPrototype {
  name: string;
  fields: QLFieldPrototype[];
  description?: string;
}
