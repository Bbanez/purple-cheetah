import * as crypto from 'crypto';
import Axios, { Method } from 'axios';
import { JWT, JWTEncoding } from '../jwt';

export interface MiracleRequest {
  url: string;
  method: Method;
  headers?: any;
  data?: any;
}

export interface MiracleResponse {
  success: boolean;
  response?: {
    status: number;
    headers: any;
    data: any;
  };
  error?: any;
}

export class MiracleClient {
  private tokenUnpacked?: JWT;

  constructor(
    private readonly defaultRequestConfig: MiracleRequest,
    private readonly serviceName: string,
    private readonly secret: string,
    private readonly requestAccessTokenUrl: string,
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
    const conf: MiracleRequest = JSON.parse(
      JSON.stringify(this.defaultRequestConfig),
    );
    conf.url = conf.url + config.url;
    conf.method = config.method;
    if (!conf.headers) {
      conf.headers = {
        Authorization: this.token,
      };
    }
    if (config.headers) {
      // tslint:disable-next-line: forin
      for (const key in config.headers) {
        conf.headers[key] = config.headers[key];
      }
    }
    if (config.data && typeof config.data === 'object') {
      conf.headers['Content-Type'] = 'application/json';
    }
    conf.data = config.data;
    if (
      !this.tokenUnpacked ||
      this.tokenUnpacked.payload.iat + this.tokenUnpacked.payload.exp <
        Date.now()
    ) {
      await this.requestAccessToken();
    }
    try {
      const result = await Axios(conf);
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

  private async requestAccessToken(): Promise<void> {
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
          serviceName: this.serviceName,
          timestamp,
          signature,
        }),
      ).toString('base64');
    const result = await Axios({
      url: this.requestAccessTokenUrl,
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
    });
    this.token = result.data.accessToken;
    const tokenUnpacked = JWTEncoding.decode(this.token);
    if (tokenUnpacked instanceof Error) {
      throw tokenUnpacked;
    }
    this.tokenUnpacked = tokenUnpacked;
  }
}
