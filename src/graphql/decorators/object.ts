import { QLObjectPrototype } from '../interfaces';
import { QLEntryBuffer } from '../buffer';
import { QLResponseFactory } from '../factories';

export function QLObject(config: QLObjectPrototype) {
  return (target: any) => {
    QLEntryBuffer.addObject(QLResponseFactory.create(config.name).object);
    QLEntryBuffer.addObject(config);
  };
}
