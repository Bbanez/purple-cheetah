import { HiveEventData } from '../hive-event-data.model';
import * as crypto from 'crypto';

/** @ignore */
export class HiveEventDataFactory {
  public static get instance(): HiveEventData {
    return new HiveEventData(
      crypto.randomBytes(6).toString('base64'),
      Date.now(),
      '',
      {},
    );
  }
}
