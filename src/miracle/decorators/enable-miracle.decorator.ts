import { MiracleConnection } from '../miracle-connection';
import { Miracle } from '../miracle';
import { MiracleService } from '../interfaces/miracle-service.interface';
import { MiracleServiceBuffer } from '../miracle-service-buffer';
import { MiracleAuthController } from '../controllers/miracle-auth.controller';
import { JWTConfig, JWTConfigService, JWTEncryptionAlg } from '../../jwt';

/**
 * Decorator that creates a Miracle Server and/or Client
 * depending on a configuration.
 */
export function EnableMiracle(config: {
  /**
   * JWT configuration that will be used
   * for creating and validating tokens.
   */
  jwtTokenConfig: {
    alg: JWTEncryptionAlg;
    issuer: string;
    secret: string;
    expIn: number;
  };
  /** Create a Miracle Client. */
  client?: {
    /**
     * Name of service that will try
     * to connect to Miracle Server.
     */
    serviceName: string;
    /** Server for a service. */
    secret: string;
    /** URL of Miracle Server. */
    connectionUrl: string;
    /**
     * Headers that will be included
     * in every request.
     */
    defaultHeaders?: Array<{
      key: string;
      value: string;
    }>;
    token?: string;
  };
  /** Create a Miracle Server. */
  server?: {
    /**
     * List of services that are allowed
     * to connect to a given Miracle Server.
     */
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
