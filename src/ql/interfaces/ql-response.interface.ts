import { QLError } from './ql-error.interface';

export interface QLResponse<T> {
  error?: QLError;
  edge?: T;
  edges?: T;
}
