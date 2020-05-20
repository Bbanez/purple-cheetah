export interface MiracleRequest {
  key: string;
  nonce: string;
  timestamp: number;
  signature: string;
  payload: string;
}

export const MiracleRequestSchema = {
  key: {
    __type: 'string',
    __required: true,
  },
  nonce: {
    __type: 'string',
    __required: true,
  },
  timestamp: {
    __type: 'number',
    __required: true,
  },
  signature: {
    __type: 'string',
    __required: true,
  },
  payload: {
    __type: 'string',
    __required: true,
  },
};
