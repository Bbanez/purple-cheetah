import { MiracleConnection } from '../miracle-connection';
import { Miracle } from '../miracle';
import { MiracleService } from '../interfaces/miracle-service.interface';
import { MiracleServiceBuffer } from '../miracle-service-buffer';
import { MiracleAuthController } from '../controllers/miracle-auth.controller';
import { JWTConfig, JWTConfigService, JWTEncryptionAlg } from '../../jwt';

export function EnableMiracle(config: {
  jwtTokenConfig: {
    alg: JWTEncryptionAlg,
    issuer: string,
    secret: string,
    expIn: number,
  };
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
  return (target: any) => {
    const token: JWTConfig = {
      id: 'miracle-token-config',
      alg: config.jwtTokenConfig.alg,
      expIn: config.jwtTokenConfig.expIn,
      issuer: config.jwtTokenConfig.issuer,
      secret: config.jwtTokenConfig.secret,
    };
    JWTConfigService.add(token);
    if (config.client) {
      Miracle.setConnection({
        serviceName: config.client.serviceName,
        secret: config.client.secret,
        connectionUrl: config.client.connectionUrl,
        defaultHeaders: config.client.defaultHeaders,
        token: config.client.token,
      });
    }
    if (config.server) {
      config.server.services.forEach(e => {
        MiracleServiceBuffer.add(e);
      });
      if (target.prototype.controllers) {
        target.prototype.controllers.push(
          new MiracleAuthController(config.server.services),
        );
      } else {
        target.prototype.controllers = [
          new MiracleAuthController(config.server.services),
        ];
      }
    }
  };
}
