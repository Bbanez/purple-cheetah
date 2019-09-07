import * as crypto from 'crypto';
import Axios from 'axios';

import { JWT, JWTEncoding } from '../jwt';
import { MiracleRequest } from './interfaces/miracle-request.interface';
import { MiracleResponse } from './interfaces/miracle-response.interface';

export class MiracleConnection {
  private tokenUnpacked?: JWT;
  private connected: boolean = false;
  private services: Array<{
    name: string;
    url: string;
  }>;

  constructor(
    private readonly serviceName: string,
    private readonly secret: string,
    private readonly connectionUrl: string,
    private readonly defaultHeaders?: Array<{
      key: string;
      value: string;
    }>,
    private token?: string,
  ) {
    if (this.token) {
      const tokenUnpacked = JWTEncoding.decode(this.token);
      if (tokenUnpacked instanceof Error) {
        throw tokenUnpacked;
      }
      this.tokenUnpacked = tokenUnpacked;
    }
  }

  public async request(config: MiracleRequest): Promise<MiracleResponse> {
    if (!config.headers) {
      config.headers = {};
    }
    if (this.defaultHeaders) {
      // tslint:disable-next-line: forin
      for (const i in this.defaultHeaders) {
        config.headers[this.defaultHeaders[i].key] = this.defaultHeaders[
          i
        ].value;
      }
    }
    const targetService = this.services.find(
      e => e.name === config.serviceName,
    );
    if (!targetService) {
      return {
        success: false,
        error: new Error(
          `Service with name '${config.serviceName}' does not exist.`,
        ),
      };
    }
    const url = targetService.url + config.uri;
    if (config.data && typeof config.data === 'object') {
      config.headers['Content-Type'] = 'application/json';
    }
    if (
      !this.tokenUnpacked ||
      this.tokenUnpacked.payload.iat + this.tokenUnpacked.payload.exp <
        Date.now() ||
      this.connected === false
    ) {
      await this.connect();
    }
    config.headers.Authorization = 'Bearer ' + this.token;
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
    const result = await Axios({
      url: this.connectionUrl,
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
    });
    this.token = result.data.accessToken;
    this.services = result.data.services;
    this.connected = true;
    const tokenUnpacked = JWTEncoding.decode(this.token);
    if (tokenUnpacked instanceof Error) {
      throw tokenUnpacked;
    }
    this.tokenUnpacked = tokenUnpacked;
  }
}
