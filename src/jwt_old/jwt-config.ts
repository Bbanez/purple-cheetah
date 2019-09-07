export interface IJWTConfig {
  secret: string;
  issuer: string;
  expIn: number;
  refTokenExpIn: number;
}

export class JWTConfig {
  private static config: IJWTConfig = {
    secret: 'SECRET',
    issuer: 'localhost',
    expIn: 300000,
    refTokenExpIn: 2592000000,
  };

  public static init(config: IJWTConfig) {
    this.config = JSON.parse(JSON.stringify(config));
  }

  public static get(key: string) {
    return this.config[key];
  }
}
