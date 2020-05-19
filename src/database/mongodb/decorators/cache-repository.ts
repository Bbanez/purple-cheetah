import { RepositoryPrototype } from '../interfaces';
import { Entity } from '../models';

export function CacheRepository<T extends Entity>(config: {
  repository: RepositoryPrototype<T>;
}) {
  return async (target: any) => {
    const cache: Entity[] = await config.repository.findAll();
    target.prototype.cache = cache;
  };
}
