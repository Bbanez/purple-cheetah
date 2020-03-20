import { QLField } from './ql-field.interface';

export interface QLInput {
  name: string;
  fields: QLField[];
  description?: string;
}
