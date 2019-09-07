export interface MiracleResponse {
  success: boolean;
  response?: {
    status: number;
    headers: any;
    data: any;
  };
  error?: any;
}
