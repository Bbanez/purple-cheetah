import { MiracleClient } from './miracle-client.module';

export class Miracle {
  private static miracleClient?: MiracleClient;

  public static get client() {
    return JSON.parse(JSON.stringify(this.miracleClient));
  }

  public static setClient(client: MiracleClient) {
    this.miracleClient = JSON.parse(JSON.stringify(client));
  }
}
