import * as mongoDB from '../mongodb';
import { MongoDBConfig } from '../interfaces/config';

export function EnableMongoDB(config: MongoDBConfig) {
  return (target: any) => {
    mongoDB.MongoDB.connect(config);
  };
}
