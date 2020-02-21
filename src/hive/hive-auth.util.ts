import { Socket } from 'socket.io';
import * as crypto from 'crypto';
import { IHiveSocketUserService } from './interfaces/hive-socket-user-service.interface';
import { HiveConnectionService } from './hive-connection.service';
import { HiveConnection } from './models/hive-connection.model';
import { HiveEventData } from './models/hive-event-data.model';

/**
 * Helper class used for managing auth.
 */
export class HiveAuth {
  private static userService: IHiveSocketUserService;

  /**
   * Initialize Hive Socket User Service.
   */
  public static init(userService: IHiveSocketUserService) {
    this.userService = userService;
  }

  /**
   * Validate if connection to a Hive Server is authorized.
   */
  public static async connectionAuthorization(
    socket: Socket,
  ): Promise<void | Error> {
    try {
      const data = {
        key: socket.request._query.key,
        timestamp: parseInt(socket.request._query.timestamp, 10),
        signature: socket.request._query.signature,
      };
      if (
        data.timestamp < Date.now() - 3000 ||
        data.timestamp > Date.now() + 3000
      ) {
        throw new Error('Invalid timestamp.');
      }
      if (this.isKeyValid(data.key) === false) {
        throw new Error('Invalid Key was provided.');
      }
      const user = await this.userService.findById(data.key);
      if (user === null) {
        throw new Error('User does not exist.');
      }
      const hmac = crypto.createHmac('sha256', user.secret);
      hmac.setEncoding('hex');
      hmac.write(data.key + data.timestamp);
      hmac.end();
      const checkSignature = hmac.read().toString();
      if (data.signature !== checkSignature) {
        throw new Error('Bad signature.');
      }
      HiveConnectionService.add(new HiveConnection(socket, user, true));
    } catch (error) {
      return error;
    }
  }

  /**
   * Validate if sender of an event is authenticated.
   */
  public static messageAuthentication(
    data: HiveEventData,
    user: {
      secret: string;
    },
  ): Error | undefined {
    if (!data.nonce || typeof data.nonce !== 'string') {
      return new Error('Missing or invalid `none` type.');
    }
    if (!data.signature || typeof data.signature !== 'string') {
      return new Error('Missing or invalid `signature` type.');
    }
    if (!data.timestamp || typeof data.timestamp !== 'number') {
      return new Error('Missing or invalid `timestamp` type.');
    }
    if (
      data.timestamp < Date.now() - 3000 ||
      data.timestamp > Date.now() + 3000
    ) {
      return new Error('Invalid timestamp.');
    }
    const rawData = JSON.parse(JSON.stringify(data));
    delete rawData.signature;
    const dataAsString: string = Buffer.from(JSON.stringify(rawData)).toString(
      'base64',
    );
    const hmac = crypto.createHmac('sha256', user.secret);
    hmac.setEncoding('hex');
    hmac.write(dataAsString);
    hmac.end();
    const checkSignature = hmac.read().toString();
    if (checkSignature !== data.signature) {
      return new Error('Invalid signature.');
    }
    return undefined;
  }

  /**
   * Create an event message signature.
   */
  public static sign(
    data: HiveEventData,
    user: {
      secret: string;
    },
  ): string {
    delete data.signature;
    const hmac = crypto.createHmac('sha256', user.secret);
    hmac.setEncoding('hex');
    hmac.write(Buffer.from(JSON.stringify(data)).toString('base64'));
    hmac.end();
    return hmac.read().toString();
  }

  private static isKeyValid(key: string) {
    if (key.length !== 24) {
      return false;
    }
    const ALLOWED_CHARS = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
    ];
    let good = false;
    for (let i = 0; i < key.length; i++) {
      good = false;
      for (const j in ALLOWED_CHARS) {
        if (key.charAt(i) === ALLOWED_CHARS[j]) {
          good = true;
          break;
        }
      }
      if (good === false) {
        return false;
      }
    }
    return true;
  }
}
