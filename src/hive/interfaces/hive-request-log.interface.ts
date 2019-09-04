export interface IHiveRequestLog {
  gateway: {
    nonce: string;
    method?: string;
    path?: string;
    ipAddress?: string;
    timestamp?: number;
    tpr?: number;
  };
  request?: {
    hiveUserUsername?: string;
    authorization?: string;
  };
  response?: {
    status?: number;
    body?: string;
    stack?: string;
  };
}
