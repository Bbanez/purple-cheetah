import * as mongoose from 'mongoose';
import { Logger } from '../logger';
import { AppLogger } from '../decorators/app-logger.decorator';

export interface MongooseConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  name: string;
}

export class Mongoose {
  private static config?: MongooseConfig;
  @AppLogger(Mongoose)
  private static logger: Logger;

  public static connect(config: MongooseConfig) {
    if (!Mongoose.config) {
      Mongoose.config = config;
      Mongoose.openConnection();
      setInterval(Mongoose.openConnection, 30000);
    }
  }

  public static isConnected(): boolean {
    return mongoose.connection.readyState === 0 ? false : true;
  }

  private static async openConnection() {
    if (mongoose.connection.readyState === 0) {
      try {
        await mongoose.connect(
          'mongodb://' +
            Mongoose.config.user +
            ':' +
            Mongoose.config.password +
            '@' +
            Mongoose.config.host +
            ':' +
            Mongoose.config.port +
            '/' +
            Mongoose.config.name,
          {
            useNewUrlParser: true,
          },
        );
        Mongoose.logger.info('.connect', 'Successful.');
      } catch (error) {
        Mongoose.logger.error('.connect', error);
      }
    }
  }
}
