import { QLInputPrototype } from '../interfaces';
import { QLEntryBuffer } from '../buffer';

export function QLInput(config: QLInputPrototype) {
  return (target: any) => {
    QLEntryBuffer.addInput(config);
  };
}
