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
 *  @CreateLogger(MyClass)
 *  private logger: Logger;
 * }
 * ```
 */
export function CreateLogger(parentClass: { name: string }) {
  return (target: any, name: string | symbol) => {
    target[name] = new Logger(parentClass.name);
  };
}
