export interface MiracleServiceKeyStoreConfig {
  name: string;
  key: string;
  secret: string;
  iv: string;
  pass: string;
  policy: {
    incoming: Array<{
      method: string;
      path: string;
      from: string[];
    }>;
    outgoing: Array<{
      name: string;
      method: string;
      path: string;
    }>;
  };
}
