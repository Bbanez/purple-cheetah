export interface MiracleToken {
  header: {
    type: string;
    alg: string;
  };
  payload: {
    iss: string;
    iat: number;
    exp: number;
    userKey: string;
  };
  signature: string;
}
