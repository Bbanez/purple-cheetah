import { Model } from 'mongoose';
import { IEntity, Entity } from '../models';
import { Logger } from '../../../logging';

export interface CacheRepositoryPrototype<T> {
  cache: T[];
  findAll: () => Promise<T[]>;
  findAllById: (ids: string[]) => Promise<T[]>;
  findById: (id: string) => Promise<T | null>;
  add: (e: Entity) => Promise<boolean>;
  update: (e: Entity) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<boolean | number>;
}
