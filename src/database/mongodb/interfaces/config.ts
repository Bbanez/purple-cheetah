export interface MongoDBConfig {
  selfHosted?: {
    user: {
      name: string;
      password: string;
    };
    db: {
      name: string;
      host: string;
      port?: number;
    };
  };
  atlas?: {
    user: {
      name: string;
      password: string;
    };
    db: {
      name: string;
      cluster: string;
      readWrite: boolean;
    };
  };
}
