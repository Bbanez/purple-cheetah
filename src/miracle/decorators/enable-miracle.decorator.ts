import { MiracleConnection } from '../miracle-connection';
import { Miracle } from '../miracle';
import { MiracleService } from '../interfaces/miracle-service.interface';
import { MiracleServiceBuffer } from '../miracle-service-buffer';

export function EnableMiracle(config: {
  client?: {
    serviceName: string;
    secret: string;
    connectionUrl: string;
    defaultHeaders?: Array<{
      key: string;
      value: string;
    }>;
    token?: string;
  };
  server?: {
    services: MiracleService[];
  };
}) {
  return async (target: any) => {
    if (config.client) {
      const miracleConnection = new MiracleConnection(
        config.client.serviceName,
        config.client.secret,
        config.client.connectionUrl,
        config.client.defaultHeaders,
        config.client.token,
      );
      await miracleConnection.connect();
      Miracle.setConnection(miracleConnection);
    }
    if (config.server) {
      config.server.services.forEach(e => {
        MiracleServiceBuffer.add(e);
      });
    }
  };
}
