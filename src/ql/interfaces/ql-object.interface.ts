import { QLField } from './ql-field.interface';

export interface QLObject {
  name: string;
  fields: QLField[];
  description?: string;
}
