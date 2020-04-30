import * as mongoose from 'mongoose';
import { Logger } from '../../logging';
import { MongoDBConfig } from './interfaces';

export class MongoDB {
  private static config?: MongoDBConfig;
  private static logger: Logger = new Logger('Mongoose');

  public static connect(config: MongoDBConfig) {
    if (!this.config) {
      this.config = config;
      this.openConnection();
      setInterval(this.openConnection, 30000);
    }
  }

  public static isConnected(): boolean {
    return mongoose.connection.readyState === 0 ? false : true;
  }

  private static async openConnection() {
    if (mongoose.connection.readyState === 0) {
      if (this.config.selfHosted) {
        let url: string =
          'mongodb://' +
          this.config.selfHosted.user.name +
          ':' +
          this.config.selfHosted.user.password +
          '@' +
          this.config.selfHosted.db.host;
        if (this.config.selfHosted.db.port) {
          url = url + ':' + this.config.selfHosted.db.port;
        }
        url = url + '/' + this.config.selfHosted.db.name;
        try {
          await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
          this.logger.info('.connect', 'Successful.');
        } catch (error) {
          this.logger.error('.connect', error);
        }
      } else if (this.config.atlas) {
        const url: string =
          'mongodb+srv://' +
          this.config.atlas.user.name +
          ':' +
          this.config.atlas.user.password +
          '@' +
          this.config.atlas.db.cluster +
          '/' +
          this.config.atlas.db.name +
          '?readWrite=' +
          this.config.atlas.db.readWrite +
          '&w=majority';
        try {
          await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
          this.logger.info('.connect', 'Successful.');
        } catch (error) {
          this.logger.error('.connect', error);
        }
      } else {
        this.logger.error('.openConnection', 'Invalid configuration.');
        throw new Error();
      }
    }
  }
}
