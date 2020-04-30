import * as crypto from 'crypto';
import { Signature } from './interfaces';

export class HTTPSignature {
  public static create(payload: any, hmacSecret: string): Signature {
    const sign: Signature = {
      nonce: crypto.randomBytes(6).toString('hex'),
      timestamp: Date.now(),
      payload: '',
      signature: '',
    };
    const hmac = crypto.createHmac('sha256', hmacSecret);
    hmac.setEncoding('hex');
    if (typeof payload === 'object') {
      hmac.write(
        `${sign.nonce}&${sign.timestamp}&${Buffer.from(
          JSON.stringify(payload),
        ).toString('base64')}`,
      );
    } else {
      hmac.write(
        `${sign.nonce}&${sign.timestamp}&${Buffer.from('' + payload).toString(
          'base64',
        )}`,
      );
    }
    hmac.end();
    sign.signature = hmac.read().toString();
    sign.payload = payload;
    return sign;
  }

  public static verify(
    signature: Signature,
    hmacSecret: string,
    timeRange?: [number, number],
  ) {
    let timeR: [number, number] = [10000, 10000];
    if (timeRange) {
      timeR = timeRange;
    }
    if (
      signature.timestamp < Date.now() - timeR[0] ||
      signature.timestamp > Date.now() + timeR[1]
    ) {
      throw new Error('Timestamp is out if range.');
    }
    const hmac = crypto.createHmac('sha256', hmacSecret);
    hmac.setEncoding('hex');
    if (typeof signature.payload === 'object') {
      hmac.write(
        `${signature.nonce}&${signature.timestamp}&${Buffer.from(
          JSON.stringify(signature.payload),
        ).toString('base64')}`,
      );
    } else {
      hmac.write(
        `${signature.nonce}&${signature.timestamp}&${Buffer.from(
          '' + signature.payload,
        ).toString('base64')}`,
      );
    }
    hmac.end();
    const checkSignature = hmac.read().toString();
    if (checkSignature !== signature.signature) {
      throw new Error('Invalid signature.');
    }
  }
}
