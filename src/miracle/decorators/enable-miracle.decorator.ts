import { MiracleRequest, MiracleClient } from '../miracle-client.module';
import { Miracle } from '../miracle';

export function EnableMiracle(config: {
  client: {
    serviceName: string;
    secret: string;
    requestAccessTokenUrl: string;
    defaultRequestConfig?: MiracleRequest;
  };
}) {
  return async (target: any) => {
    const miracleClient = new MiracleClient(
      config.client.serviceName,
      config.client.secret,
      config.client.requestAccessTokenUrl,
      config.client.defaultRequestConfig,
    );
    await miracleClient.requestAccessToken();
    Miracle.setClient(miracleClient);
  };
}
