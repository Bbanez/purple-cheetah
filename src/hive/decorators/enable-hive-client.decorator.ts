import { HiveEventName } from '../models/hive-event-name.enum';
import { HiveEventData } from '../models/hive-event-data.model';
import { HiveClient } from '../hive.client';
import { HiveHttpExceptionHandler } from '../middleware/hive-http-exception.middleware';

export function EnableHiveClient(config: {
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
  return (target: any) => {
    HiveClient.connect({
      hiveServerUrl: config.hiveServerUrl,
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
