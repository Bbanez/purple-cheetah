import Axios from 'axios';
import { MiracleConnection } from './miracle-connection';
import { MiracleRequest } from './interfaces/miracle-request.interface';
import { MiracleResponse } from './interfaces/miracle-response.interface';

/**
 * Helper class for managing Miracle connection.
 */
export class Miracle {
  private static miracleConnection?: MiracleConnection;
  private static tryToConnectTimer?: any;

  /** Get current connection. */
  public static get connection() {
    return Miracle.miracleConnection;
  }

  /** Open a connection to a Miracle Server. */
  public static setConnection(config: {
    /**
     * Name of the service that is trying
     * to connect to a Miracle Server
     */
    serviceName: string;
    /** Secret key for specified service. */
    secret: string;
    /** Url to Miracle Server. */
    connectionUrl: string;
    /** Headers that will be included in every request. */
    defaultHeaders?: Array<{
      key: string;
      value: string;
    }>;
    /** Is service already have valid JWT, it can be provided here. */
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
    clearInterval(Miracle.tryToConnectTimer);
    Miracle.tryToConnectTimer = setInterval(Miracle.tryToConnect, 10000);
  }

  /** Send a request to other Miracle service. */
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
    if (Miracle.miracleConnection.connected === false) {
      await Miracle.miracleConnection.connect();
    }
  }
}
