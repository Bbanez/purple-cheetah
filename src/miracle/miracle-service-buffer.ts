import { MiracleService } from './interfaces/miracle-service.interface';

export class MiracleServiceBuffer {
  private static services: MiracleService[] = [];

  public static add(service: MiracleService) {
    MiracleServiceBuffer.services.push(service);
  }

  public static get(name: string): MiracleService | undefined {
    return this.services.find(e => e.name === name);
  }
}
