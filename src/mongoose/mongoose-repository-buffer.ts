import { Model, Schema, model } from 'mongoose';
import { IEntity } from './models/mongoose-entity.model';

export class MongooseRepositoryBuffer {
  private static repoBuffer: Array<{
    name: string;
    repo: Model<IEntity>;
  }> = [];

  public static addRepo(name: string, repo: Model<IEntity>) {
    if (MongooseRepositoryBuffer.repoBuffer.find(e => e.name === name)) {
      throw Error(`Mongoose repository with name '${name}' exists.`);
    }
    MongooseRepositoryBuffer.repoBuffer.push({
      name,
      repo,
    });
  }

  public static has(name: string) {
    return MongooseRepositoryBuffer.repoBuffer.find(e => e.name === name)
      ? true
      : false;
  }

  public static get(name: string) {
    return MongooseRepositoryBuffer.repoBuffer.find(e => e.name === name);
  }
}
