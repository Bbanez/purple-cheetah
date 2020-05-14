export interface MiracleKeyStoreConfig {
  secret: string;
  iv: string;
  pass: string;
  services: Array<{
    name: string;
    key: string;
    secret: string;
    incomingPolicy: Array<{
      method: string;
      path: string;
      from: string[];
    }>;
  }>;
}

export const MiracleKeyStoreConfigSchema = {
  secret: {
    __type: 'string',
    __required: true,
  },
  iv: {
    __type: 'string',
    __required: true,
  },
  pass: {
    __type: 'string',
    __required: true,
  },
  services: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: {
        name: {
          __type: 'string',
          __required: true,
        },
        key: {
          __type: 'string',
          __required: true,
        },
        secret: {
          __type: 'string',
          __required: true,
        },
        incomingPolicy: {
          __type: 'array',
          __required: true,
          __child: {
            __type: 'object',
            __content: {
              method: {
                __type: 'string',
                __required: true,
              },
              type: {
                __type: 'string',
                __required: true,
              },
              from: {
                __type: 'array',
                __required: true,
                __child: {
                  __type: 'string',
                },
              },
            },
          },
        },
      },
    },
  },
};
