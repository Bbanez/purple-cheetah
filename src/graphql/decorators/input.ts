import { QLInputPrototype } from '../interfaces';

export function QLInput(config: QLInputPrototype) {
  return (target: any) => {
    target.prototype.get = config;
  };
}
