/**
 * Decorator used to annotate a variable as a Service.
 *
 * ### Example
 *
 * ```ts
 *  export class MyClass {
 *    @Service(MyService)
 *    private service: MyService;
 *  }
 * ```
 */
export function Service(objectClass: any) {
  return (target: any, name: string | symbol) => {
    target[name] = new objectClass();
  };
}
