import * as osu from 'node-os-utils';
import { MiracleRegistryExtended } from './interfaces';
import Axios, { Method } from 'axios';
import { MiracleSecurity } from './security';

export class Miracle {
  private static security: MiracleSecurity;
  private static registries: MiracleRegistryExtended[];

  private static checkSecurity() {
    if (!this.security) {
      throw new Error(
        `Miracle security is not initialized. Please make sure that ` +
          `you are connected to Miracle Key Store.`,
      );
    }
  }

  private static checkRegistries() {
    if (!this.registries) {
      throw new Error(
        `Please check that you are connected to Miracle Registry server.`,
      );
    }
  }

  private static findRegistry(name: string) {
    this.checkRegistries();
    const registry = this.registries.find((e) => e.name === name);
    if (!registry) {
      throw new Error(
        `Service with name "${name}" does not exist in registry. ` +
          `Please check if name is correct and if you are connected to Miracle Registry server.`,
      );
    }
    return registry;
  }

  public static init(security: MiracleSecurity) {
    this.security = security;
  }

  public static async register(
    origin: string,
    config: {
      name: string;
      origin: string;
      ssl: boolean;
      heartbeat: string;
      stats: {
        cpu: number;
        ram: number;
        lastCheck: number;
      };
    },
  ) {
    this.checkSecurity();
    // TODO: Add error handling.
    const result = await Axios({
      url: `${origin}/miracle/registry/register`,
      method: 'POST',
      data: this.security.sign(config),
    });
    this.registries = result.data.registry.map((e) => {
      e.instancePointer = 0;
      return e;
    });
  }

  public static async request(config: {
    service: string;
    uri: string;
    method: Method;
    headers?: any;
    queries?: any;
    data?: any;
  }) {
    if (
      this.security.checkOutgoingPolicy(
        config.service,
        config.uri,
        config.method,
      ) === false
    ) {
      throw new Error(
        `Service with name "${config.service}" is not ` +
          `listed in outgoing policy for ` +
          `"${config.method}: ${config.uri}".`,
      );
    }
    this.checkSecurity();
    const registry = this.findRegistry(config.service);
    if (!config.data) {
      config.data = {};
    }
    if (config.queries) {
      const keyValuePairs: string[] = [];
      for (const key in config.queries) {
        keyValuePairs.push(`${key}=${encodeURIComponent(config.queries[key])}`);
      }
      if (keyValuePairs.length > 0) {
        config.uri = `${config.uri}?${keyValuePairs.join('&')}`;
      }
    }
    const instance = registry.instances[registry.instancePointer];
    for (const i in this.registries) {
      if (this.registries[i].name === registry.name) {
        this.registries[i].instancePointer =
          (this.registries[i].instancePointer + 1) %
          this.registries[i].instances.length;
        break;
      }
    }
    const result = await Axios({
      url: `${instance.origin}${config.uri}`,
      method: config.method,
      headers: config.headers,
      data: this.security.sign(config.data),
    });
    return {
      data: result.data,
      headers: result.headers,
    };
  }
}
