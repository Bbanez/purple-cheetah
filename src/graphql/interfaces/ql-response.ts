import { QLError } from './ql-error';

export interface QLResponse<T> {
  error?: QLError;
  edge?: T;
  edges?: T;
}
