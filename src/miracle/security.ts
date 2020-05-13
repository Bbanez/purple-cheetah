import * as crypto from 'crypto';
import { MiracleRequest } from './interfaces';

export class MiracleSecurity {
  private config?: {
    key: string;
    secret: string;
    aes: {
      iv: string;
      key: Buffer;
    };
  };

  constructor(key: string, secret: string, IV: string, AESPass: string) {
    this.config = {
      key,
      secret,
      aes: {
        key: crypto.scryptSync(AESPass, 'salt', 32),
        iv: IV,
      },
    };
  }

  public sign(payload: any): MiracleRequest {
    const request: MiracleRequest = {
      key: this.config.key,
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
      .createHmac('sha-256', this.config.secret)
      .update(request.timestamp + request.nonce + request.key + request.payload)
      .digest()
      .toString('hex');
    return request;
  }

  public process(request: MiracleRequest): any {
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
      .createHmac('sha-256', this.config.secret)
      .update(request.timestamp + request.nonce + request.key + request.payload)
      .digest()
      .toString('hex');
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
