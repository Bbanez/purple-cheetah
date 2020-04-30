import { QLArgPrototype } from './ql-arg-prototype';

export interface QLFieldPrototype {
  name: string;
  type: string;
  args?: QLArgPrototype[];
  description?: string;
}
