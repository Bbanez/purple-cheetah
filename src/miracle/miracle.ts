import { MiracleClient } from "./miracle-client.module";

export class Miracle {
  private static miracleClient?: MiracleClient;

  public static get client() {
    return this.miracleClient;
  }

  public static setClient() {
    
  }
}