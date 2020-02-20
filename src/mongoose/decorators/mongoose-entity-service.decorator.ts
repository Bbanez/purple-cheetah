import { model, Schema, Types } from 'mongoose';
import { IEntity, Entity } from '../models/mongoose-entity.model';
import { Logger } from '../../logger';
import { Mongoose } from '../mongoose.util';
import { MongooseRepositoryBuffer } from '../mongoose-repository-buffer';

export function MongooseEntityService(config: {
  db: {
    name: string;
  };
  entity: {
    schema: Schema;
    convertInterfaceToClassFunction?: (e: IEntity) => Entity;
  };
}) {
  return (target: any) => {
    if (MongooseRepositoryBuffer.has(config.db.name) === true) {
      target.prototype.repo = MongooseRepositoryBuffer.get(config.db.name);
    } else {
      target.prototype.repo = model(config.db.name, config.entity.schema);
      MongooseRepositoryBuffer.addRepo(config.db.name, target.prototype.repo);
    }
    target.prototype.logger = new Logger(target.name);

    if (typeof target.prototype.findAll === 'undefined') {
      target.prototype.findAll = async (): Promise<Entity[]> => {
        if (Mongoose.isConnected() === false) {
          target.prototype.logger.error(
            '.findAll',
            'Mongoose is not connected to database.',
          );
          return [];
        }
        const entities = await target.prototype.repo.find();
        try {
          if (config.entity.convertInterfaceToClassFunction) {
            return entities.map(e => {
              return config.entity.convertInterfaceToClassFunction(e);
            });
          } else {
            return entities;
          }
        } catch (error) {
          target.prototype.logger.error('.findAll', {
            errorMessage: error.message,
            stack: error.stack,
          });
          return [];
        }
      };
    }
    if (typeof target.prototype.findAllById === 'undefined') {
      target.prototype.findAllById = async (
        ids: string[],
      ): Promise<Entity[]> => {
        if (Mongoose.isConnected() === false) {
          target.prototype.logger.error(
            '.findAllById',
            'Mongoose is not connected to database.',
          );
          return [];
        }
        try {
          const entities = await target.prototype.repo.find({
            _id: { $in: ids },
          });
          if (config.entity.convertInterfaceToClassFunction) {
            return entities.map(e => {
              return config.entity.convertInterfaceToClassFunction(e);
            });
          } else {
            return entities;
          }
        } catch (error) {
          target.prototype.logger.error('.findAllById', {
            errorMessage: error.message,
            stack: error.stack,
          });
          return [];
        }
      };
    }
    if (typeof target.prototype.findById === 'undefined') {
      target.prototype.findById = async (
        id: string,
      ): Promise<Entity | null> => {
        if (Mongoose.isConnected() === false) {
          target.prototype.logger.error(
            '.findById',
            'Mongoose is not connected to database.',
          );
          return null;
        }
        try {
          const entity = await target.prototype.repo.findOne({ _id: id });
          if (entity === null) {
            target.prototype.logger.warn(
              '.findById',
              'Entity ' + id + ' does not exist.',
            );
            return null;
          } else {
            if (config.entity.convertInterfaceToClassFunction) {
              return config.entity.convertInterfaceToClassFunction(entity);
            } else {
              return entity;
            }
          }
        } catch (error) {
          target.prototype.logger.error('.findById', {
            errorMessage: error.message,
            stack: error.stack,
          });
          return null;
        }
      };
    }
    if (typeof target.prototype.add === 'undefined') {
      target.prototype.add = async (e: Entity): Promise<boolean> => {
        if (Mongoose.isConnected() === false) {
          target.prototype.logger.error(
            '.add',
            'Mongoose is not connected to database.',
          );
          return false;
        }
        if (typeof e._id === 'string') {
          e._id = new Types.ObjectId(e._id);
        }
        e.createdAt = Date.now();
        e.updatedAt = Date.now();
        try {
          await new target.prototype.repo(e).save();
          return true;
        } catch (error) {
          target.prototype.logger.error('.add', {
            errorMessage: error.message,
            stack: error.stack,
          });
          return false;
        }
      };
    }
    if (typeof target.prototype.update === 'undefined') {
      target.prototype.update = async (e: Entity): Promise<boolean> => {
        if (typeof e._id === 'string') {
          e._id = new Types.ObjectId(e._id);
        }
        if (!e._id.toHexString) {
          target.prototype.logger.warn(
            '.update',
            'Entity ID is not of type `ObjectId`.',
          );
          return false;
        }
        if (Mongoose.isConnected() === false) {
          target.prototype.logger.error(
            '.update',
            'Mongoose is not connected to database.',
          );
          return false;
        }
        try {
          const getEntityResult: any | null = await target.prototype.findById(
            e._id.toHexString(),
          );
          if (getEntityResult === null) {
            target.prototype.logger.error('.update', 'Entity does not exist');
            return false;
          } else {
            e.updatedAt = Date.now();
            e.createdAt = getEntityResult.createdAt;
            await target.prototype.repo.updateOne(
              { _id: e._id.toHexString() },
              e,
            );
            return true;
          }
        } catch (error) {
          target.prototype.logger.error('.update', {
            errorMessage: error.message,
            stack: error.stack,
          });
          return false;
        }
      };
    }
    if (typeof target.prototype.deleteById === 'undefined') {
      target.prototype.deleteById = async (id: string): Promise<boolean> => {
        if (Mongoose.isConnected() === false) {
          target.prototype.logger.error(
            '.deleteById',
            'Mongoose is not connected to database.',
          );
          return false;
        }
        try {
          const result = await target.prototype.repo.deleteOne({ _id: id });
          if (!result) {
            target.prototype.logger.error(
              '.deleteById',
              'Cannot run query. Result is `undefined`.',
            );
            return false;
          } else {
            return result.n === 1 ? true : false;
          }
        } catch (error) {
          target.prototype.logger.error('.deleteById', {
            errorMessage: error.message,
            stack: error.stack,
          });
          return false;
        }
      };
    }
    if (typeof target.prototype.deleteAllById === 'undefined') {
      target.prototype.deleteAllById = async (
        ids: string[],
      ): Promise<boolean | number> => {
        if (Mongoose.isConnected() === false) {
          target.prototype.logger.error(
            '.deleteAllById',
            'Mongoose is not connected to database.',
          );
          return false;
        }
        try {
          const result = await target.prototype.repo.deleteMany({
            _id: { $in: ids },
          });
          if (!result) {
            target.prototype.logger.error(
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
          target.prototype.logger.error('.deleteAllById', {
            errorMessage: error.message,
            stack: error.stack,
          });
          return false;
        }
      };
    }
  };
}
