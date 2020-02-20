/**
 * Available event types that Hive [Client](/globals.html#enablehiveclient)
 * and [Server](/globals.html#enablehiveserver) can understand.
 */
export enum HiveEventName {
  CLIENT_ERROR = 'CLIENT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  GLOBAL_ERROR = 'GLOBAL_ERROR',
  HTTP_REQUEST_ERROR = 'HTTP_REQUEST_ERROR',

  SYSTEM_TRIGGER = 'SYSTEM_TRIGGER',

  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
  SUCCESS = 'SUCCESS',

  LOG_WRITE = 'LOG_WRITE',
  LOG_READ = 'LOG_READ',
  LOG_SUBSCRIBE = 'LOG_SUBSCRIBE',
}
