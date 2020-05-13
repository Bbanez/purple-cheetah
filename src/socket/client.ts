import { SocketConnection } from './interfaces';

export class SocketClient {
  private static connections: SocketConnection[] = [];

  public static get(name: string) {
    return this.connections.find((e) => e.name === name);
  }
}
