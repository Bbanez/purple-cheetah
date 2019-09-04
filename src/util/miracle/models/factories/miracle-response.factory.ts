import {
  MiracleResponse,
  MiracleResponseError,
} from '../miracle-response.model';

export class MiracleResponseFactory {
  public static success(payload: any): MiracleResponse {
    return {
      success: true,
      payload,
    };
  }

  public static error(error: MiracleResponseError): MiracleResponse {
    return {
      success: false,
      error,
    };
  }
}
