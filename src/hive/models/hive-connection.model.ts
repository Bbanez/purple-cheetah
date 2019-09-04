import { Socket } from 'socket.io';
import { IHiveSocketUser } from '../interfaces/hive-socket-user.interface';

export interface IHiveConnection {
  socket: Socket;
  user: IHiveSocketUser;
  connected: boolean;
}

export class HiveConnection implements IHiveConnection {
  constructor(
    public socket: Socket,
    public user: IHiveSocketUser,
    public connected: boolean,
  ) {}
}
