export interface QLError {
  status: number;
  message: string;
  payloadBase64?: string;
}

export const QLErrorSchema = `
type ResponseError {
  status: Int!
  message: String!
  payloadBase64: String
}
`;
