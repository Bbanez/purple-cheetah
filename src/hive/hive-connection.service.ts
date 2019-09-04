import { HiveConnection } from './models/hive-connection.model';
import { HiveEventName } from './models/hive-event-name.enum';

export class HiveConnectionService {
  private static connections: HiveConnection[] = [];

  public static findAll() {
    return this.connections;
  }

  public static findBySocketId(socketId: string): HiveConnection | null {
    const connection = this.connections.find(e => e.socket.id === socketId);
    return connection ? connection : null;
  }

  public static findByAllowedEventName(
    eventName: HiveEventName,
  ): HiveConnection[] {
    const cs: HiveConnection[] = [];
    for (const i in this.connections) {
      if (
        this.connections[i].user.allowedEventNames.find(e => e === eventName)
      ) {
        cs.push(this.connections[i]);
      }
    }
    return cs;
  }

  public static add(connection: HiveConnection) {
    this.connections.push(connection);
  }

  public static update(connection: HiveConnection) {
    for (const i in this.connections) {
      if (this.connections[i].socket.id === connection.socket.id) {
        this.connections[i].socket = connection.socket;
        this.connections[i].user = connection.user;
        this.connections[i].connected = connection.connected;
      }
    }
  }

  public static deleteBySocketId(id: string) {
    this.connections = this.connections.filter(e => e.socket.id !== id);
  }
}
