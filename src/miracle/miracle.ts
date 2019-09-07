import { MiracleConnection } from './miracle-connection';

export class Miracle {
  private static miracleConnection?: MiracleConnection;

  public static get connection() {
    return this.miracleConnection;
  }

  public static setConnection(connection: MiracleConnection) {
    this.miracleConnection = JSON.parse(JSON.stringify(connection));
  }
}
