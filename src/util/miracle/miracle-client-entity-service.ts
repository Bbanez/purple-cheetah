import Axios, { Method } from 'axios';
import * as crypto from 'crypto';
import { MiracleResponse, MiracleResponseType } from './models/miracle-response.model';
import { MiracleUser } from './models/miracle-user.model';
import { MiracleToken } from './models/miracle-token.model';
import { MiracleTokenEncoding } from './miracle-token-encoder';
import { ObjectUtility } from '../object.util';
import { MiracleResponseFactory } from './models/factories/miracle-response.factory';
import { HttpStatus } from '../../models/http-status.model';

export class MiracleClientEntityService<T> {
  private readonly token: {
    raw: string;
    unpacked: MiracleToken;
  };

  constructor(
    private readonly config: {
      miracleAuthServerUrl: string;
      miracleProducerUrl: string
      user: MiracleUser;
      entitySchema: any;
    },
  ) {}

  public async findAll(): Promise<T[] | MiracleResponse> {
    const data = await this.send({
      uri: '',
      method: 'GET',
    });
    if (data.success === false) {
      return data;
    }
    if (data.payload instanceof Array) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < data.payload.length; i = i + 1) {
        try {
          ObjectUtility.compareWithSchema(data.payload[i], this.config.entitySchema);
        } catch (e) {
          return MiracleResponseFactory.error({
            type: MiracleResponseType.PRODUCER,
            propagate: false,
            httpStatus: HttpStatus.UNPROCESSABLE_ENTITY,
            message: e.message,
          });
        }
      }
      return data.payload;
    } else {
      return MiracleResponseFactory.error({
          type: MiracleResponseType.PRODUCER,
          propagate: true,
          httpStatus: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Expected an array but did not got it from a Miracle Server',
      });
    }
  }

  public async findById(id: string): Promise<T | MiracleResponse> {
    const data = await this.send({
      uri: '/' + id,
      method: 'GET',
    });
    if (data.success === false) {
      return data;
    }
    try {
      ObjectUtility.compareWithSchema(data.payload[0], this.config.entitySchema);
    } catch (e) {
      return MiracleResponseFactory.error({
        type: MiracleResponseType.PRODUCER,
        propagate: true,
        httpStatus: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Invalid entity schema was returned by Miracle Server.\r\n' + e.message,
      });
    }
    return data.payload[0];
  }

  public async add(entity: T): Promise<T | MiracleResponse> {
    const data = await this.send({
      uri: '',
      method: 'POST',
      body: entity,
    });
    if (data.success === false) {
      return data;
    }
    return data.payload;
  }

  public async update(entity: T): Promise<string | MiracleResponse> {
    const data = await this.send({
      uri: '',
      method: 'PUT',
      body: entity,
    });
    if (data.success === false) {
      return data;
    }
    return data.payload;
  }

  public async deleteById(id: string): Promise<string | MiracleResponse> {
    const data = await this.send({
      uri: '/' + id,
      method: 'DELETE',
    });
    if (data.success === false) {
      return data;
    }
    return data.payload._id;
  }

  protected async send(config: {
    uri: string;
    method: Method;
    body?: any;
  }): Promise<MiracleResponse> {
    const getTokenResult = await this.getAccessTokenIfNeeded();
    if (getTokenResult) {
      return getTokenResult;
    }
    try {
      const result = await Axios(
        this.config.miracleProducerUrl + config.uri,
        {
          method: config.method,
          headers: {
            Authorization: this.token.raw,
          },
          data: config.body,
        },
      );
      return result.data;
    } catch (e) {
      return e.response.data;
    }
  }

  private async getAccessTokenIfNeeded(): Promise<void | MiracleResponse> {
    if (
      !this.token ||
      this.token.unpacked.payload.iat +
        this.token.unpacked.payload.exp <
        Date.now()
    ) {
      await this.getAccessToken();
      return;
    }
  }

  private async getAccessToken(): Promise<void | MiracleResponse> {
    try {
      const result = await Axios(this.config.miracleAuthServerUrl, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthorizationHeader(this.config.user),
        },
      });
      this.token.raw = 'Bearer ' + result.data.payload.access_token;
      this.token.unpacked = MiracleTokenEncoding.decode(
        'Bearer ' + result.data.payload.access_token,
      );
    } catch (e) {
      return e.response.data;
    }
  }

  private async getAuthorizationHeader(user: MiracleUser) {
    const timestamp = Date.now();
    const hmac = crypto.createHmac('sha256', user.secret);
    hmac.setEncoding('hex');
    hmac.write(user.key + timestamp);
    hmac.end();
    const signature = hmac.read().toString();
    const data = Buffer.from(`${user.key},${timestamp},${signature}`).toString(
      'base64',
    );
    return `Bearer ${data}`;
  }
}
