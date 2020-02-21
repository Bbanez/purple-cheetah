import * as socketIO from 'socket.io-client';
import * as crypto from 'crypto';
import { HiveEventName } from './models/hive-event-name.enum';
import { HiveEventData } from './models/hive-event-data.model';
import { HiveAuth } from './hive-auth.util';
import { Logger } from '../logger';

/**
 * Helper class used for Hive Client.
 */
export class HiveClient {
  private static hiveServerBaseUrl: string;
  private static socketServerPath: string;
  private static incomingEventHandlers: Array<{
    eventName: HiveEventName;
    callback: (error?: Error, data?: HiveEventData) => Promise<void>;
  }>;
  private static socket;
  private static logger: Logger;
  private static user: {
    key: string;
    secret: string;
  };
  private static connected: boolean = false;

  /**
   * Establish connection with Hive Server.
   */
  public static connect(config: {
    /** For example: `http://1.1.1.1:8000` */
    hiveServerBaseUrl: string;
    /** For example: `/path/to/hive/server` */
    socketServerPath: string;
    /** Hive Client user. */
    user: {
      key: string;
      secret: string;
    };
    /** Array of event handler functions. */
    incomingEventHandlers: Array<{
      eventName: HiveEventName;
      callback: (error?: Error, data?: HiveEventData) => Promise<void>;
    }>;
  }) {
    HiveClient.hiveServerBaseUrl = config.hiveServerBaseUrl;
    HiveClient.socketServerPath = config.socketServerPath;
    HiveClient.logger = new Logger('HiveClient');
    HiveClient.user = config.user;
    HiveClient.incomingEventHandlers = config.incomingEventHandlers;
    HiveClient.tryToConnectToServer();
    setInterval(this.tryToConnectToServer, 10000);
  }

  /**
   * Send an event to Hive Server.
   */
  public static async send(eventName: HiveEventName, payload: any) {
    if (HiveClient.connected === true) {
      const data: HiveEventData = new HiveEventData(
        crypto.randomBytes(6).toString('hex'),
        Date.now(),
        '',
        payload,
      );
      data.signature = HiveAuth.sign(data, HiveClient.user);
      HiveClient.socket.emit(eventName, data);
    }
  }

  private static async tryToConnectToServer() {
    if (HiveClient.connected === false) {
      HiveClient.logger.info(
        '.tryToConnectToServer',
        'Trying to connect to Hive Server on ' +
          `'${HiveClient.hiveServerBaseUrl}${HiveClient.socketServerPath}' ...`,
      );
      HiveClient.socket = await socketIO(HiveClient.hiveServerBaseUrl, {
        path: HiveClient.socketServerPath,
        query: HiveClient.signConnectionQuery(),
      });
      HiveClient.socket.on('connect', () => {
        HiveClient.logger.info('.connect', 'Connected to Hive Server.');
        HiveClient.connected = true;
      });
      HiveClient.socket.on('disconnect', () => {
        HiveClient.logger.warn('.disconnect', 'Disconnected from Hive Server.');
        HiveClient.connected = false;
      });
      HiveClient.incomingEventHandlers.forEach(e => {
        HiveClient.logger.info(
          '.tryToConnectToServer',
          `Mapping done for event '${e.eventName}'.`,
        );
        HiveClient.socket.on(e.eventName, async (data: HiveEventData) => {
          if (e.eventName !== HiveEventName.GLOBAL_ERROR) {
            const authError = HiveAuth.messageAuthentication(
              data,
              HiveClient.user,
            );
            if (authError) {
              e.callback(authError);
              return;
            }
          }
          e.callback(undefined, data);
        });
      });
    }
  }

  private static signConnectionQuery() {
    const timestamp: number = Date.now();
    const hmac = crypto.createHmac('sha256', this.user.secret);
    hmac.setEncoding('hex');
    hmac.write(this.user.key + timestamp);
    hmac.end();
    return {
      key: this.user.key,
      timestamp,
      signature: hmac.read().toString(),
    };
  }
}
