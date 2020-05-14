import { MiracleRegistry } from '../interfaces';

export class MiracleRegistryServerCache {
  private static registries: MiracleRegistry[] = [];

  public static add(registry: {
    name: string;
    origin: string;
    ssl: boolean;
    heartbeat: string;
    stats: {
      cpu: number;
      ram: number;
      lastCheck: number;
    };
  }) {
    let found = false;
    for (const i in this.registries) {
      if (this.registries[i].name === registry.name) {
        found = true;
        let instanceFound = false;
        for (const j in this.registries[i].instances) {
          if (this.registries[i].instances[j].origin === registry.origin) {
            instanceFound = true;
            this.registries[i].instances[j] = {
              available: true,
              origin: registry.origin,
              ssl: registry.ssl,
              stats: registry.stats,
            };
            break;
          }
        }
        if (instanceFound === false) {
          this.registries[i].instances.push({
            available: true,
            origin: registry.origin,
            ssl: registry.ssl,
            stats: registry.stats,
          });
        }
        break;
      }
    }
    if (found === false) {
      this.registries.push({
        name: registry.name,
        heartbeat: registry.heartbeat,
        instances: [
          {
            available: true,
            origin: registry.origin,
            ssl: registry.ssl,
            stats: registry.stats,
          },
        ],
      });
    }
  }

  public static findAll() {
    return JSON.parse(JSON.stringify(this.registries));
  }

  public static findByName(name: string) {
    return this.registries.find((e) => e.name === name);
  }

  public static findInstance(name: string, origin: string) {
    const registry = this.findByName(name);
    if (!registry) {
      return;
    }
    return registry.instances.find((e) => e.origin === origin);
  }

  public static clear() {
    this.registries = this.registries
      .map((e) => {
        e.instances = e.instances.filter((t) => t.available === true);
        return e;
      })
      .filter((e) => e.instances.length === 0);
  }
}
