import Axios from 'axios';
import { MiracleConnection } from './miracle-connection';
import { MiracleRequest } from './interfaces/miracle-request.interface';
import { MiracleResponse } from './interfaces/miracle-response.interface';

export class Miracle {
  private static miracleConnection?: MiracleConnection;
  private static tryToConnectTimer?: any;

  public static get connection() {
    return Miracle.miracleConnection;
  }

  public static setConnection(config: {
    serviceName: string;
    secret: string;
    connectionUrl: string;
    defaultHeaders?: Array<{
      key: string;
      value: string;
    }>;
    token?: string;
  }) {
    Miracle.miracleConnection = new MiracleConnection(
      config.serviceName,
      config.secret,
      config.connectionUrl,
      config.defaultHeaders,
      config.token,
    );
    Miracle.miracleConnection.connect();
    Miracle.tryToConnectTimer = setInterval(Miracle.tryToConnect, 10000);
  }

  public static async request(
    config: MiracleRequest,
  ): Promise<MiracleResponse> {
    if (Miracle.miracleConnection.connected === true) {
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
          Date.now()
      ) {
        await Miracle.miracleConnection.connect();
      }
      config.headers.Authorization =
        'Bearer ' + Miracle.miracleConnection.token;
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
        if (
          error.response &&
          error.response.status &&
          error.response.headers &&
          error.response.data
        ) {
          return {
            success: false,
            response: {
              status: error.response.status,
              headers: error.response.headers,
              data: error.response.data,
            },
            error,
          };
        } else {
          return {
            success: false,
            response: {
              status: 500,
              headers: {},
              data: {
                message: 'Unknown error.',
              },
            },
            error,
          };
        }
      }
    } else {
      return {
        success: false,
        response: {
          status: 0,
          data: 'none',
          headers: {},
        },
        error: new Error('Not connected to Miracle Server.'),
      };
    }
  }

  private static async tryToConnect() {
    if (!Miracle.miracleConnection.connected === false) {
      await Miracle.miracleConnection.connect();
    }
  }
}
