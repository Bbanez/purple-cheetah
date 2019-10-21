import * as crypto from 'crypto';
import Axios, { AxiosResponse } from 'axios';

import { JWT, JWTEncoding } from '../jwt';
import { AppLogger } from '../decorators/app-logger.decorator';
import { Logger } from '../logger';

export class MiracleConnection {
  public tokenUnpacked?: JWT;
  public connected: boolean = false;
  public services: Array<{
    name: string;
    url: string;
  }>;
  @AppLogger(MiracleConnection)
  private logger: Logger;

  constructor(
    public readonly serviceName: string,
    public readonly secret: string,
    public readonly connectionUrl: string,
    public readonly defaultHeaders?: Array<{
      key: string;
      value: string;
    }>,
    public token?: string,
  ) {
    if (this.token) {
      const tokenUnpacked = JWTEncoding.decode(this.token);
      if (tokenUnpacked instanceof Error) {
        throw tokenUnpacked;
      }
      this.tokenUnpacked = tokenUnpacked;
    }
  }

  // public request = async (config: MiracleRequest): Promise<MiracleResponse> => {
  //   if (!config.headers) {
  //     config.headers = {};
  //   }
  //   if (this.defaultHeaders) {
  //     // tslint:disable-next-line: forin
  //     for (const i in this.defaultHeaders) {
  //       config.headers[this.defaultHeaders[i].key] = this.defaultHeaders[
  //         i
  //       ].value;
  //     }
  //   }
  //   const targetService = this.services.find(
  //     e => e.name === config.serviceName,
  //   );
  //   if (!targetService) {
  //     throw new Error(
  //       `Service with name '${config.serviceName}' does not exist.`,
  //     );
  //   }
  //   const url = targetService.url + config.uri;
  //   if (config.data && typeof config.data === 'object') {
  //     config.headers['Content-Type'] = 'application/json';
  //   }
  //   if (
  //     !this.tokenUnpacked ||
  //     this.tokenUnpacked.payload.iat + this.tokenUnpacked.payload.exp <
  //       Date.now() ||
  //     this.connected === false
  //   ) {
  //     await this.connect();
  //   }
  //   config.headers.Authorization = 'Bearer ' + this.token;
  //   try {
  //     const result = await Axios({
  //       url,
  //       method: config.method,
  //       headers: config.headers,
  //       data: config.data,
  //     });
  //     return {
  //       success: true,
  //       response: {
  //         status: result.status,
  //         data: result.data,
  //         headers: result.headers,
  //       },
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       response: {
  //         status: error.response.status,
  //         headers: error.response.headers,
  //         data: error.response.data,
  //       },
  //       error,
  //     };
  //   }
  // }

  public async connect(): Promise<void> {
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(6).toString('base64');
    const hmac: crypto.Hmac = crypto.createHmac('sha256', this.secret);
    hmac.setEncoding('hex');
    hmac.write(nonce + ';' + this.serviceName + ';' + timestamp);
    hmac.end();
    const signature = hmac.read().toString();
    const authHeader =
      'Bearer ' +
      Buffer.from(
        JSON.stringify({
          nonce,
          name: this.serviceName,
          timestamp,
          signature,
        }),
      ).toString('base64');
    let result: AxiosResponse;
    try {
      result = await Axios({
        url: this.connectionUrl,
        method: 'POST',
        headers: {
          Authorization: authHeader,
        },
      });
    } catch (error) {
      this.logger.error('.connect', 'Failed to connect to Miracle Server.');
      this.logger.error('.connect', error);
      return;
    }
    this.token = result.data.accessToken;
    this.services = result.data.services;
    const tokenUnpacked = JWTEncoding.decode(this.token);
    if (tokenUnpacked instanceof Error) {
      throw tokenUnpacked;
    }
    this.connected = true;
    this.tokenUnpacked = tokenUnpacked;
    this.logger.info('.connect', 'Connected to Miracle Server.');
  }
}
