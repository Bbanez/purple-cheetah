import { HiveEventName } from '../models/hive-event-name.enum';
import { HiveEventData } from '../models/hive-event-data.model';
import { HiveClient } from '../hive.client';
import { HiveHttpExceptionHandler } from '../middleware/hive-http-exception.middleware';

/**
 * Decorator what annotates an [Application]() as a
 * [Hive Client](/classes/hiveclient.html).
 * [Find out more about Hive Protocol](https://purple-cheetah.dev/tutorials/hive).
 */
export function EnableHiveClient(config: {
  /**
   * For example: `https://api.example.com`
   */
  hiveServerBaseUrl: string;
  /**
   * For example: `/socket`
   */
  socketServerPath: string;
  /**
   * Valid key and key secret for a Hive Client.
   * Used for creating http signature when [sending](/classes/hiveclient.html#send)
   * messages to [Hive Server](/globals.html#enablehiveserver).
   */
  user: {
    key: string;
    secret: string;
  };
  /**
   * Array of handlers for incoming messages from
   * [Hive Server](/globals.html#enablehiveserver)
   */
  incomingEventHandlers: Array<{
    eventName: HiveEventName;
    callback: (error?: Error, data?: HiveEventData) => Promise<void>;
  }>;
}) {
  return (target: any) => {
    HiveClient.connect({
      hiveServerBaseUrl: config.hiveServerBaseUrl,
      socketServerPath: config.socketServerPath,
      user: config.user,
      incomingEventHandlers: config.incomingEventHandlers,
    });
    if (target.prototype.exceptionHandlers) {
      target.prototype.exceptionHandlers.push(new HiveHttpExceptionHandler());
    } else {
      target.prototype.exceptionHandlers = [new HiveHttpExceptionHandler()];
    }
  };
}
