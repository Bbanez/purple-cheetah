import * as socketIO from 'socket.io';
import { Logger } from '../../logging';
import { SocketEventHandler } from '../interfaces';

export function EnableSocketServer(config: {
  origins: string[];
  path: string;
  allowConnectionFn?: (request: any) => Promise<boolean>;
  verifyConnectionFn?: (socket: socketIO.Socket) => Promise<boolean>;
  eventHandlerFns?: SocketEventHandler[];
}) {
  return (target: any) => {
    const logger: Logger = new Logger('SocketServer');
    if (!target.prototype.server) {
      logger.error(
        '.init',
        'Target prototype does not contains HTTP Server object.',
      );
      throw new Error('Missing HTTP server object.');
    }
    const socketIOServer = socketIO(target.prototype.server, {
      path: config.path,
      origins: config.origins,
      cookie: false,
      allowRequest: async (request, callback) => {
        logger.info('.allowConnection', 'Incoming connection...');
        if (!config.allowConnectionFn) {
          callback(0, true);
          return;
        }
        if ((await config.allowConnectionFn(request)) === false) {
          callback(401, false);
          return;
        }
        callback(0, true);
      },
    });
    socketIOServer.use(async (socket, next) => {
      if (config.verifyConnectionFn) {
        if ((await config.verifyConnectionFn(socket)) === false) {
          next(`Failed to verify connection for socket "${socket.id}".`);
          return;
        }
      }
      next();
    });
    socketIOServer.on('connection', async (socket) => {
      logger.info(
        '.connection',
        `Socket "${socket.id}" connected successfully.`,
      );
      config.eventHandlerFns.forEach((e) => {
        socket.on(e.name, e.handler);
      });
      socket.on('disconnect', () => {
        logger.info(
          '.disconnect',
          `Socket "${socket.id}" has been disconnected.`,
        );
        socket.disconnect(true);
      });
    });
  };
}
