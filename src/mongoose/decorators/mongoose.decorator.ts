import { MongooseConfig, Mongoose } from '../mongoose.util';

export function EnableMongoose(config: MongooseConfig) {
  return (target: any) => {
    Mongoose.connect(config);
  };
}
