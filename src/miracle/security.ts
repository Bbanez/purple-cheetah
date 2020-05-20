import * as crypto from 'crypto';
import { MiracleRequest, MiracleRequestSchema } from './interfaces';
import { ObjectUtility } from '../util';
import { Request } from 'express';

export class MiracleSecurity {
  private config?: {
    name: string;
    key: string;
    secret: string;
    aes: {
      iv: string;
      key: Buffer;
    };
    policy: {
      incoming: Array<{
        method: string;
        path: string;
        from: string[];
      }>;
      outgoing: Array<{
        name: string;
        method: string;
        path: string;
      }>;
    };
  };

  constructor(
    name: string,
    key: string,
    secret: string,
    IV: string,
    AESPass: string,
    policy: {
      incoming: Array<{
        method: string;
        path: string;
        from: string[];
      }>;
      outgoing: Array<{
        name: string;
        method: string;
        path: string;
      }>;
    },
  ) {
    this.config = {
      name,
      key,
      secret,
      aes: {
        key: crypto.scryptSync(AESPass, 'salt', 32),
        iv: IV,
      },
      policy,
    };
  }

  public sign(payload: any): MiracleRequest {
    const request: MiracleRequest = {
      key: this.config.name,
      nonce: crypto.randomBytes(6).toString('hex'),
      timestamp: 0,
      payload: '',
      signature: '',
    };
    if (typeof payload === 'object') {
      request.payload = JSON.stringify(payload);
    } else {
      request.payload = `${payload}`;
    }
    request.payload = this.encrypt(request.payload);
    request.timestamp = Date.now();
    request.signature = crypto
      .createHmac('sha256', this.config.secret)
      .update(request.timestamp + request.nonce + request.key + request.payload)
      .digest('hex');
    return request;
  }

  public checkIncomingPolicy(
    key: string,
    uri: string,
    method: string,
  ): boolean {
    return this.config.policy.incoming.find(
      (incoming) =>
        incoming.method === method &&
        incoming.path === uri &&
        incoming.from.find((from) => from === key),
    )
      ? true
      : false;
  }

  public checkOutgoingPolicy(
    name: string,
    uri: string,
    method: string,
  ): boolean {
    return this.config.policy.outgoing.find(
      (outgoing) =>
        outgoing.method === method &&
        outgoing.path === uri &&
        outgoing.name === name,
    )
      ? true
      : false;
  }

  public process(request: MiracleRequest): any {
    ObjectUtility.compareWithSchema(request, MiracleRequestSchema, 'request');
    if (typeof request.timestamp !== 'number') {
      throw new Error(
        `Expected property "timestamp" to be a number but got "${typeof request.timestamp}".`,
      );
    }
    if (
      request.timestamp < Date.now() - 3000 ||
      request.timestamp > Date.now() + 1000
    ) {
      throw new Error('Timestamp is out of range.');
    }
    const checkSignature = crypto
      .createHmac('sha256', this.config.secret)
      .update(request.timestamp + request.nonce + request.key + request.payload)
      .digest('hex');
    if (checkSignature !== request.signature) {
      throw new Error('Invalid signature.');
    }
    const payload = this.decrypt(request.payload);
    try {
      return JSON.parse(payload);
    } catch {
      return payload;
    }
  }

  public processRequest<T>(expressRequest: Request): T {
    const request: MiracleRequest = expressRequest.body;
    ObjectUtility.compareWithSchema(request, MiracleRequestSchema, 'request');
    if (
      this.checkIncomingPolicy(
        request.key,
        expressRequest.originalUrl,
        expressRequest.method,
      ) === false
    ) {
      throw new Error(
        `Key "${request.key}" is not authorized to access` +
          `"${expressRequest.method}: ${expressRequest.originalUrl}" resource.`,
      );
    }
    if (typeof request.timestamp !== 'number') {
      throw new Error(
        `Expected property "timestamp" to be a number but got "${typeof request.timestamp}".`,
      );
    }
    if (
      request.timestamp < Date.now() - 3000 ||
      request.timestamp > Date.now() + 1000
    ) {
      throw new Error('Timestamp is out of range.');
    }
    const checkSignature = crypto
      .createHmac('sha256', this.config.secret)
      .update(request.timestamp + request.nonce + request.key + request.payload)
      .digest('hex');
    if (checkSignature !== request.signature) {
      throw new Error('Invalid signature.');
    }
    const payload = this.decrypt(request.payload);
    try {
      return JSON.parse(payload);
    } catch {
      return payload as any;
    }
  }

  public encrypt(text: string): string {
    let encText = '';
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      this.config.aes.key,
      this.config.aes.iv,
    );
    encText = cipher.update(text, 'utf8', 'hex');
    encText += cipher.final('hex');
    return encText;
  }

  public decrypt(text: string): string {
    let decText = '';
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.config.aes.key,
      this.config.aes.iv,
    );
    decText = decipher.update(text, 'hex', 'utf8');
    return decText;
  }
}
