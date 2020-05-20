import {
  MiracleKeyStoreConfig,
  MiracleServiceKeyStoreConfig,
} from '../interfaces';

export class MiracleKeyStoreConfigCache {
  private static cache: MiracleKeyStoreConfig;

  public static init(config: MiracleKeyStoreConfig) {
    this.cache = config;
  }

  public static get(): MiracleKeyStoreConfig {
    return JSON.parse(JSON.stringify(this.cache));
  }

  public static byName(name: string): MiracleServiceKeyStoreConfig {
    const conf: MiracleServiceKeyStoreConfig = {
      name,
      key: '',
      secret: this.cache.secret,
      iv: this.cache.iv,
      pass: this.cache.pass,
      policy: {
        incoming: [],
        outgoing: [],
      },
    };
    this.cache.services.forEach((service) => {
      if (service.name === name) {
        conf.key = service.key;
        conf.policy.incoming = service.incomingPolicy;
      } else {
        const inc = service.incomingPolicy.find((incoming) =>
          incoming.from.includes(name),
        );
        if (inc) {
          conf.policy.outgoing.push({
            name: service.name,
            method: inc.method,
            path: inc.path,
          });
        }
      }
    });
    return conf;
  }
}
