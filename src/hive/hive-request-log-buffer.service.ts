import { IHiveRequestLog } from './interfaces/hive-request-log.interface';
import { ObjectUtility } from '../util/object.util';

/**
 * Helper class used for buffering log messages. All incoming
 * messages to Hive Server will be stored in a memory and every
 * 60s seconds `emptyRequestLogBufferHandler` will be called.
 */
export class HiveRequestLogBufferService {
  private static logs: IHiveRequestLog[] = [];
  private static emptyRequestLogBufferHandler: (
    logs: IHiveRequestLog[],
  ) => Promise<void>;
  private static timer;

  /**
   * Initialize timer and buffer.
   */
  public static init(
    emptyRequestLogBufferHandler: (logs: IHiveRequestLog[]) => Promise<void>,
  ) {
    HiveRequestLogBufferService.emptyRequestLogBufferHandler = emptyRequestLogBufferHandler;
    HiveRequestLogBufferService.timer = setTimeout(
      HiveRequestLogBufferService.emptyBuffer,
      60000,
    );
  }

  /**
   * Add new log entry to the buffer.
   */
  public static add(log: IHiveRequestLog) {
    for (const i in HiveRequestLogBufferService.logs) {
      if (HiveRequestLogBufferService.logs[i].gateway.nonce === log.gateway.nonce) {
        HiveRequestLogBufferService.logs[i] = ObjectUtility.combine(
          HiveRequestLogBufferService.logs[i],
          log,
        );
        return;
      }
    }
    HiveRequestLogBufferService.logs.push(log);
    if (HiveRequestLogBufferService.logs.length > 1000) {
      HiveRequestLogBufferService.emptyBuffer();
    }
  }

  private static emptyBuffer() {
    clearTimeout(HiveRequestLogBufferService.timer);
    if (HiveRequestLogBufferService.logs.length > 0) {
      const logs = [...HiveRequestLogBufferService.logs];
      HiveRequestLogBufferService.logs = [];
      HiveRequestLogBufferService.emptyRequestLogBufferHandler(logs);
    }
    HiveRequestLogBufferService.timer = setTimeout(
      HiveRequestLogBufferService.emptyBuffer,
      60000,
    );
  }
}
