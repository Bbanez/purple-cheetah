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

  public static byKey(key: string): MiracleServiceKeyStoreConfig {
    const conf: MiracleServiceKeyStoreConfig = {
      name: '',
      key,
      secret: this.cache.secret,
      iv: this.cache.iv,
      pass: this.cache.pass,
      policy: {
        incoming: [],
        outgoing: [],
      },
    };
    this.cache.services.forEach((service) => {
      if (service.key === key) {
        conf.name = service.name;
        conf.policy.incoming = service.incomingPolicy;
      } else {
        const inc = service.incomingPolicy.find((incoming) =>
          incoming.from.includes(service.name),
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
