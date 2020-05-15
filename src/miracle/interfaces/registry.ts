export interface MiracleRegistry {
  name: string;
  instances: Array<{
    origin: string;
    available: boolean;
    ssl: boolean;
    stats: {
      lastCheck: number;
      cpu: number;
      ram: number;
    };
  }>;
  heartbeat: string;
}

export interface MiracleRegistryExtended {
  name: string;
  instancePointer: number;
  instances: Array<{
    origin: string;
    available: boolean;
    ssl: boolean;
    stats: {
      lastCheck: number;
      cpu: number;
      ram: number;
    };
  }>;
  heartbeat: string;
}
