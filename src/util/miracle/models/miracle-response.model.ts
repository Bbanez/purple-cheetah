export enum MiracleResponseType {
  PRODUCER = 'PRODUCER',
  CONSUMER = 'CONSUMER',
  GLOBAL = 'GLOBAL',
}

export interface MiracleResponseError {
  type: MiracleResponseType;
  propagate: boolean;
  httpStatus: number;
  message: any;
}

export interface MiracleResponse {
  success: boolean;
  payload?: any;
  error?: MiracleResponseError;
}
