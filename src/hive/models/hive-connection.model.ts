import { Socket } from 'socket.io';
import { IHiveSocketUser } from '../interfaces/hive-socket-user.interface';

/** @ignore */
export interface IHiveConnection {
  socket: Socket;
  user: IHiveSocketUser;
  connected: boolean;
}

/**
 * Object that holds information about a Hive Client
 * that is connected to a Hive Server.
 */
export class HiveConnection implements IHiveConnection {
  constructor(
    public socket: Socket,
    public user: IHiveSocketUser,
    public connected: boolean,
  ) {}
}
