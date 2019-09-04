import * as socketIO from 'socket.io';

import { IHiveSocketUserService } from '../interfaces/hive-socket-user-service.interface';
import { HiveEventData } from '../models/hive-event-data.model';
import { Logger } from '../../logger';
import { HiveAuth } from '../hive-auth.util';
import { HiveConnectionService } from '../hive-connection.service';
import { HiveEventName } from '../models/hive-event-name.enum';
import { HiveEventDataFactory } from '../models/factories/hive-event-data.factory';
import { IHiveEventHandler } from '../interfaces/hive-event-handler.interface';
import { HiveServerHttpExceptionHandler } from '../middleware/hive-server-http-exception.middleware';
import { IHiveRequestLog } from '../interfaces/hive-request-log.interface';
import { HiveRequestLogBufferService } from '../hive-request-log-buffer.service';

export function EnableHiveServer(config: {
  socketUserService: IHiveSocketUserService;
  emptyRequestLogBufferHandler: (logs: IHiveRequestLog[]) => Promise<void>;
  eventHandlers: IHiveEventHandler[];
}) {
  return (target: any) => {
    const logger: Logger = new Logger('HiveServer');
    HiveAuth.init(config.socketUserService);
    if (!target.prototype.server) {
      logger.error('.init', 'Server does not exist.');
      throw new Error('Server does now exist.');
    }
    if (target.prototype.exceptionHandlers) {
      target.prototype.exceptionHandlers.push(new HiveServerHttpExceptionHandler());
    } else {
      target.prototype.exceptionHandlers = [
        new HiveServerHttpExceptionHandler(),
      ];
    }
    HiveRequestLogBufferService.init(config.emptyRequestLogBufferHandler);
    const socketIOServer = socketIO(target.prototype.server, {
      path: '/hive-server',
    });
    socketIOServer.use(async (socket: socketIO.Socket, next: any) => {
      const error = await HiveAuth.connectionAuthorization(socket);
      if (error) {
        logger.warn('.connection', error.message);
      }
      next();
    });
    socketIOServer.on('connection', (socket: socketIO.Socket) => {
      const connection = HiveConnectionService.findBySocketId(socket.id);
      if (connection === null) {
        logger.warn(
          '.connectionHandler',
          'Connection does not exist in buffer.',
        );
        socket.emit(HiveEventName.GLOBAL_ERROR, 'Unauthorized.');
        socket.disconnect(true);
        return;
      } else {
        logger.info(
          '.connectionHandler',
          `New socket [socketId=${connection.socket.id}, userId=${
            connection.user._id
          }] registered.`,
        );
        const response = HiveEventDataFactory.instance;
        response.nonce = connection.user._id.toHexString();
        response.payload = {
          message: 'Successfully connected to Hive Server.',
        };
        response.signature = HiveAuth.sign(response, connection.user);
        connection.socket.emit(HiveEventName.SUCCESS, response);

        connection.socket.on('disconnect', () => {
          HiveConnectionService.deleteBySocketId(connection.socket.id);
          logger.info(
            '.disconnect',
            `Socket [socketId=${connection.socket.id}, userId=${
              connection.user._id
            }] disconnected.`,
          );
        });

        config.eventHandlers.forEach(e => {
          connection.socket.on(e.eventName, async (data: HiveEventData) => {
            if (e.eventName !== HiveEventName.GLOBAL_ERROR) {
              const authError = HiveAuth.messageAuthentication(
                data,
                connection.user,
              );
              if (authError) {
                connection.socket.emit(HiveEventName.GLOBAL_ERROR, {
                  nonce: data.nonce,
                  signature: '',
                  timestamp: Date.now(),
                  data: {
                    message: 'Unauthorized message.',
                  },
                });
                throw authError;
              }
            }
            const logSubscribeEmitData: HiveEventData =
              HiveEventDataFactory.instance;
            logSubscribeEmitData.payload = {
              original: data,
              from: {
                _id: connection.user._id.toHexString(),
                username: connection.user.username,
              },
            };
            if (
              connection.user.allowedEventNames.find(ae => ae === e.eventName)
            ) {
              logSubscribeEmitData.payload.success = true;
              await e.handler(connection, data);
            } else {
              logSubscribeEmitData.payload.success = false;
              logger.warn(
                `.${e.eventName}`,
                `User '${connection.user._id.toHexString()}' is not authorized for Event '${
                  e.eventName
                }'`,
              );
              const res: HiveEventData = {
                nonce: data.nonce,
                timestamp: Date.now(),
                signature: '',
                payload: {
                  message: `Not authorized for Event '${e.eventName}'`,
                },
              };
              res.signature = HiveAuth.sign(res, connection.user);
              connection.socket.emit(HiveEventName.GLOBAL_ERROR, res);
            }
            HiveConnectionService.findAll().forEach(c => {
              if (
                c.user.allowedEventNames.find(
                  a => a === HiveEventName.LOG_SUBSCRIBE,
                )
              ) {
                logSubscribeEmitData.signature = HiveAuth.sign(
                  logSubscribeEmitData,
                  c.user,
                );
                c.socket.emit(
                  HiveEventName.LOG_SUBSCRIBE,
                  logSubscribeEmitData,
                );
              }
            });
          });
        });
      }
    });
  };
}
