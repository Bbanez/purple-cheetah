import * as mongoose from 'mongoose';
import { Logger } from '../logger';
import { AppLogger } from '../decorators/app-logger.decorator';

/** MongooseConfig */
export interface MongooseConfig {
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
      if (Mongoose.config.selfHosted) {
        let url: string =
          'mongodb://' +
          Mongoose.config.selfHosted.user.name +
          ':' +
          Mongoose.config.selfHosted.user.password +
          '@' +
          Mongoose.config.selfHosted.db.host;
        if (Mongoose.config.selfHosted.db.port) {
          url = url + ':' + Mongoose.config.selfHosted.db.port;
        }
        url = url + '/' + Mongoose.config.selfHosted.db.name;
        try {
          await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
          Mongoose.logger.info('.connect', 'Successful.');
        } catch (error) {
          Mongoose.logger.error('.connect', error);
        }
      } else if (this.config.atlas) {
        const url: string =
          'mongodb+srv://' +
          Mongoose.config.atlas.user.name +
          ':' +
          Mongoose.config.atlas.user.password +
          '@' +
          Mongoose.config.atlas.db.cluster +
          '/' +
          Mongoose.config.atlas.db.name +
          '?readWrite=' +
          Mongoose.config.atlas.db.readWrite +
          '&w=majority';
        try {
          await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
          Mongoose.logger.info('.connect', 'Successful.');
        } catch (error) {
          Mongoose.logger.error('.connect', error);
        }
      } else {
        this.logger.error('.openConnection', 'Invalid configuration.');
        throw new Error();
      }
    }
  }
}
