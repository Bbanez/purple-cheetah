export interface QLError {
  status: number;
  message: string;
  payloadBase64?: string;
}
