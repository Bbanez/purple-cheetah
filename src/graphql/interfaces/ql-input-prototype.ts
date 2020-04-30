import { QLFieldPrototype } from './ql-field-prototype';

export interface QLInputPrototype {
  name: string;
  fields: QLFieldPrototype[];
  description?: string;
}
