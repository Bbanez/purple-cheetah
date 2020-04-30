import { QLObjectPrototype } from '../interfaces';

export function QLObject(config: QLObjectPrototype) {
  return (target: any) => {
    target.prototype.get = config;
  };
}
