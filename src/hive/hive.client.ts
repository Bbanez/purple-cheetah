import * as socketIO from 'socket.io-client';
import * as crypto from 'crypto';
import { HiveEventName } from './models/hive-event-name.enum';
import { HiveEventData } from './models/hive-event-data.model';
import { HiveAuth } from './hive-auth.util';
import { Logger } from '../logger';

export class HiveClient {
  private static hiveServerUrl: string;
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

  public static connect(config: {
    hiveServerUrl: string;
    user: {
      key: string;
      secret: string;
    };
    incomingEventHandlers: Array<{
      eventName: HiveEventName;
      callback: (error?: Error, data?: HiveEventData) => Promise<void>;
    }>;
  }) {
    HiveClient.hiveServerUrl = config.hiveServerUrl;
    HiveClient.logger = new Logger('HiveClient');
    HiveClient.user = config.user;
    HiveClient.incomingEventHandlers = config.incomingEventHandlers;
    HiveClient.tryToConnectToServer();
    setInterval(this.tryToConnectToServer, 10000);
  }

  public static async send(eventName: HiveEventName, data: HiveEventData) {
    if (HiveClient.connected === true) {
      data.signature = HiveAuth.sign(data, HiveClient.user);
      HiveClient.socket.emit(eventName, data);
    }
  }

  private static tryToConnectToServer() {
    if (HiveClient.connected === false) {
      HiveClient.socket = socketIO(HiveClient.hiveServerUrl, {
        path: '/hive-server/',
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
        HiveClient.socket.on(e.eventName, async (data: HiveEventData) => {
          if (e.eventName !== HiveEventName.GLOBAL_ERROR) {
            const authError = HiveAuth.messageAuthentication(data, HiveClient.user);
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
