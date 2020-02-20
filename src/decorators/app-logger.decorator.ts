import { Logger } from '../logger';

/**
 * Decorator that creates a new instance of a Logger
 * Object for annotated variable.
 *
 * @param parentClass Class in which instance of a Logger is created.
 *
 * ### Example
 *
 * ```ts
 * class MyClass {
 *  @AppLogger(MyClass)
 *  private logger: Logger;
 * }
 * ```
 */
export function AppLogger(parentClass: any) {
  return (target: any, name: string | symbol) => {
    target[name] = new Logger(parentClass.name);
  };
}
