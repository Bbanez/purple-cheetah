import { Model, Types } from 'mongoose';
import { IEntity, Entity } from './models/mongoose-entity.model';
import { Mongoose } from './mongoose.util';
import { Logger } from '../logger';

export abstract class EntityService<T> {
  abstract repo: Model<IEntity>;
  abstract logger: Logger;
  abstract fromIEntity(iEntity: IEntity): T;
  abstract combineObjects(oldObject: any, newObject: any): any;

  /**
   * Get all entities from database.
   */
  public async findAll(): Promise<T[]> {
    if (Mongoose.isConnected() === false) {
      this.logger.error('.findAll', 'Mongoose is not connected to database.');
      return [];
    }
    try {
      const entities = await this.repo.find();
      return entities.map(e => {
        return this.fromIEntity(e);
      });
    } catch (error) {
      this.logger.error('.findAll', {
        errorMessage: error.message,
        stack: error.stack,
      });
      return [];
    }
  }

  /**
   * Get all entities with specified IDs.
   * @param ids Entities to find.
   */
  public async findAllById(ids: string[]): Promise<T[]> {
    if (Mongoose.isConnected() === false) {
      this.logger.error(
        '.findAllById',
        'Mongoose is not connected to database.',
      );
      return [];
    }
    try {
      const entities = await this.repo.find({ _id: { $in: ids } });
      return entities.map(e => {
        return this.fromIEntity(e);
      });
    } catch (error) {
      this.logger.error('.findAllById', {
        errorMessage: error.message,
        stack: error.stack,
      });
      return [];
    }
  }

  /**
   * Get entity by its ID.
   * @param id Entity to find.
   */
  public async findById(id: string): Promise<T | null> {
    if (Mongoose.isConnected() === false) {
      this.logger.error('.findById', 'Mongoose is not connected to database.');
      return null;
    }
    try {
      const entity = await this.repo.findById(new Types.ObjectId(id));
      if (entity === null) {
        this.logger.warn('.findById', 'Entity ' + id + ' does not exist.');
        return null;
      } else {
        return this.fromIEntity(entity);
      }
    } catch (error) {
      this.logger.error('.findById', {
        errorMessage: error.message,
        stack: error.stack,
      });
      return null;
    }
  }

  /**
   * Add entity to database.
   * @param e Entity to add.
   */
  public async add(e: Entity): Promise<boolean> {
    if (Mongoose.isConnected() === false) {
      this.logger.error('.add', 'Mongoose is not connected to database.');
      return false;
    }
    if (typeof e._id === 'string') {
      e._id = new Types.ObjectId(e._id);
    }
    e.createdAt = Date.now();
    e.updatedAt = Date.now();
    try {
      await new this.repo(e).save();
      return true;
    } catch (error) {
      this.logger.error('.add', {
        errorMessage: error.message,
        stack: error.stack,
      });
      return false;
    }
  }

  /**
   * Update existing entity in database.
   * @param e Entity to update.
   */
  public async update(e: Entity): Promise<boolean> {
    if (typeof e._id === 'string') {
      e._id = new Types.ObjectId(e._id);
    }
    if (!e._id.toHexString) {
      this.logger.warn('.update', 'Entity ID is not of type `ObjectId`.');
      return false;
    }
    if (Mongoose.isConnected() === false) {
      this.logger.error('.update', 'Mongoose is not connected to database.');
      return false;
    }
    try {
      const getEntityResult: any | null = await this.findById(
        e._id.toHexString(),
      );
      if (getEntityResult === null) {
        this.logger.error('.update', 'Entity does not exist');
        return false;
      } else {
        e.updatedAt = Date.now();
        e.createdAt = getEntityResult.createdAt;
        const combined: any = this.combineObjects(getEntityResult, e);
        delete combined._id;
        await this.repo.updateOne({ _id: e._id.toHexString() }, combined);
        return true;
      }
    } catch (error) {
      this.logger.error('.update', {
        errorMessage: error.message,
        stack: error.stack,
      });
      return false;
    }
  }

  /**
   * Remove entity from database by its ID.
   * @param id Entity to delete.
   */
  public async deleteById(id: string): Promise<boolean> {
    if (Mongoose.isConnected() === false) {
      this.logger.error(
        '.deleteById',
        'Mongoose is not connected to database.',
      );
      return false;
    }
    try {
      const result = await this.repo.deleteOne({ _id: id });
      if (!result) {
        this.logger.error(
          '.deleteById',
          'Cannot run query. Result is `undefined`.',
        );
        return false;
      } else {
        return result.n === 1 ? true : false;
      }
    } catch (error) {
      this.logger.error('.deleteById', {
        errorMessage: error.message,
        stack: error.stack,
      });
      return false;
    }
  }

  /**
   * Remove all entities with matching IDs from database.
   * @param ids Entities to delete.
   */
  public async deleteAllById(ids: string[]): Promise<boolean | number> {
    if (Mongoose.isConnected() === false) {
      this.logger.error(
        '.deleteAllById',
        'Mongoose is not connected to database.',
      );
      return false;
    }
    try {
      const result = await this.repo.deleteMany({ _id: { $in: ids } });
      if (!result) {
        this.logger.error(
          '.deleteAllById',
          'Cannot run query. Result is `undefined`.',
        );
        return false;
      } else {
        if (result.n === ids.length) {
          return true;
        } else {
          return typeof result.n === 'number' ? result.n : false;
        }
      }
    } catch (error) {
      this.logger.error('.deleteAllById', {
        errorMessage: error.message,
        stack: error.stack,
      });
      return false;
    }
  }
}
