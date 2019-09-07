import { Method } from 'axios';

export interface MiracleRequest {
  serviceName: string;
  uri: string;
  method: Method;
  headers?: any;
  data?: any;
}
