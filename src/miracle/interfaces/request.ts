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
    required: true,
  },
  nonce: {
    __type: 'string',
    required: true,
  },
  timestamp: {
    __type: 'number',
    required: true,
  },
  signature: {
    __type: 'string',
    required: true,
  },
  payload: {
    __type: 'string',
    required: true,
  },
};
