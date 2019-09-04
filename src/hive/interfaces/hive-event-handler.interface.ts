import { HiveEventName } from '../models/hive-event-name.enum';
import { HiveConnection } from '../models/hive-connection.model';
import { HiveEventData } from '../models/hive-event-data.model';

export interface IHiveEventHandler {
  eventName: HiveEventName;
  handler: (connection: HiveConnection, data: HiveEventData) => Promise<void>;
}
