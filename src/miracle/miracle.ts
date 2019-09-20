import Axios from 'axios';
import { MiracleConnection } from './miracle-connection';
import { MiracleRequest } from './interfaces/miracle-request.interface';
import { MiracleResponse } from './interfaces/miracle-response.interface';

export class Miracle {
  private static miracleConnection?: MiracleConnection;

  public static get connection() {
    return Miracle.miracleConnection;
  }

  public static setConnection(connection: MiracleConnection) {
    Miracle.miracleConnection = JSON.parse(JSON.stringify(connection));
  }

  public static async request(
    config: MiracleRequest,
  ): Promise<MiracleResponse> {
    if (!config.headers) {
      config.headers = {};
    }
    if (Miracle.miracleConnection.defaultHeaders) {
      // tslint:disable-next-line: forin
      for (const i in Miracle.miracleConnection.defaultHeaders) {
        config.headers[Miracle.miracleConnection.defaultHeaders[i].key] =
          Miracle.miracleConnection.defaultHeaders[i].value;
      }
    }
    const targetService = Miracle.miracleConnection.services.find(
      e => e.name === config.serviceName,
    );
    if (!targetService) {
      throw new Error(
        `Service with name '${config.serviceName}' does not exist.`,
      );
    }
    const url = targetService.url + config.uri;
    if (config.data && typeof config.data === 'object') {
      config.headers['Content-Type'] = 'application/json';
    }
    if (
      !Miracle.miracleConnection.tokenUnpacked ||
      Miracle.miracleConnection.tokenUnpacked.payload.iat +
        Miracle.miracleConnection.tokenUnpacked.payload.exp <
        Date.now() ||
      Miracle.miracleConnection.connected === false
    ) {
      await Miracle.miracleConnection.connect();
    }
    config.headers.Authorization = 'Bearer ' + Miracle.miracleConnection.token;
    try {
      const result = await Axios({
        url,
        method: config.method,
        headers: config.headers,
        data: config.data,
      });
      return {
        success: true,
        response: {
          status: result.status,
          data: result.data,
          headers: result.headers,
        },
      };
    } catch (error) {
      return {
        success: false,
        response: {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data,
        },
        error,
      };
    }
  }
}
