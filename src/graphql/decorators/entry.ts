import {
  QLObjectPrototype,
  QLInputPrototype,
  QLResolverPrototype,
} from '../interfaces';

export function QLEntry(config: {
  objects: QLObjectPrototype[];
  inputs: QLInputPrototype[];
  resolvers: QLResolverPrototype[];
}) {
  return (target: any) => {
    target.prototype.objects = config.objects;
    target.prototype.inputs = config.objects;
    target.prototype.resolvers = config.objects;
  };
}
