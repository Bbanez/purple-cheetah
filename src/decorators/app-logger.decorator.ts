import { Logger } from '../logger';

export function AppLogger(parentClass: any) {
  return (target: any, name: string | symbol) => {
    target[name] = new Logger(parentClass.name);
  };
}
