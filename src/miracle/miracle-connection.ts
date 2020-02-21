import * as crypto from 'crypto';
import Axios, { AxiosResponse } from 'axios';

import { JWT, JWTEncoding } from '../jwt';
import { AppLogger } from '../decorators/app-logger.decorator';
import { Logger } from '../logger';

/**
 * Object that represents a connection to a Miracle Server.
 */
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

  /**
   * Connect to Miracle Server and obtain JWT.
   */
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
