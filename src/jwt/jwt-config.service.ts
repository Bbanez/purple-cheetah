import { JWTConfig } from './interfaces/jwt-config.interface';
import { ObjectUtility } from '../util/object.util';

/**
 * Service used for storing and getting JWT
 * configurations in-memory.
 */
export class JWTConfigService {
  private static configs: JWTConfig[] = [];

  /** Add new configuration. */
  public static add(config: JWTConfig) {
    ObjectUtility.compareWithSchema(
      config,
      {
        id: {
          __type: 'string',
          __required: true,
        },
        issuer: {
          __type: 'string',
          __required: true,
        },
        secret: {
          __type: 'string',
          __required: true,
        },
        alg: {
          __type: 'string',
          __required: true,
        },
        expIn: {
          __type: 'number',
          __required: true,
        },
      },
      config.id,
    );
    JWTConfigService.configs.push(config);
  }

  /** Add many new configurations. */
  public static addMany(configs: JWTConfig[]) {
    configs.forEach(config => {
      JWTConfigService.add(config);
    });
  }

  /** Get configuration. */
  public static get(id: string): JWTConfig | undefined {
    return JWTConfigService.configs.find(e => e.id === id);
  }
}
