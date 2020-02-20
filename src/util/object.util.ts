import { Types } from 'mongoose';

export class ObjectUtility {
  /**
   * Combine 2 objects into 1 following few rules:
   *    1. If master does not have a key
   *      from a slave, it will be added.
   *    2. If slaves key value is NULL, it
   *      will be ignored.
   *    3. All key values from a master that are
   *      not present in a slave will stay
   *      unmodified.
   *    4. Array key values from a slave will be
   *      just copied to master, even if it is
   *      array of objects.
   *    5. If key of a slave is an object, recursion
   *      will occur.
   * @param master Object that will be modified.
   * @param slave Object which key values will be used.
   */
  public static combine(master: object, slave: object, level?: string): any {
    if (!level) {
      level = 'root';
    }
    if (typeof master === 'undefined' && typeof slave !== 'undefined') {
      return slave;
    } else if (typeof master !== 'undefined' && typeof slave === 'undefined') {
      return master;
    } else if (typeof master === 'undefined' && typeof slave === 'undefined') {
      // tslint:disable-next-line: no-console
      console.log(`ERROR at ${level}. Master: ${master}, Slave: ${slave}`);
      return master;
    }
    let p = JSON.parse(JSON.stringify(master));
    const c = JSON.parse(JSON.stringify(slave));
    if (!p || p === null) {
      p = c;
    } else {
      for (const key in c) {
        if (typeof c[key] !== 'undefined' && c[key] !== null) {
          if (typeof c[key] === 'object') {
            if (c[key] instanceof Array) {
              p[key] = c[key];
            } else {
              p[key] = ObjectUtility.combine(p[key], c[key], `${level}.${key}`);
            }
          } else {
            p[key] = c[key];
          }
        }
      }
    }
    return p;
  }

  public static merge<T, K>(master: T, slave: K): T {
    if (!master || !slave) {
      return master;
    }
    let p = JSON.parse(JSON.stringify(master));
    const c = JSON.parse(JSON.stringify(slave));
    if (!p || p === null) {
      p = c;
    } else {
      for (const key in c) {
        if (c[key] !== null) {
          if (typeof c[key] === 'object') {
            if (c[key] instanceof Array) {
              p[key] = c[key];
            } else {
              p[key] = ObjectUtility.merge(p[key], c[key]);
            }
          } else {
            p[key] = c[key];
          }
        }
      }
    }
    if (p._id) {
      p._id = new Types.ObjectId(p._id);
    }
    return p;
  }

  /**
   * Compare object with a schema. If object does not
   * follow the rules specified by schema, error will be
   * thrown with message that describes an error. Use this
   * method in a try-catch block.
   *
   * @param object Object that will be checked.
   * @param schema Schema that object must follow.
   * @param level Since function is recursive, level indicates
   *    what property is being converted. Used for throwing errors.
   */
  public static compareWithSchema(
    object: any,
    schema: any,
    level?: string,
  ): void {
    if (typeof level === 'undefined') {
      level = 'root';
    }
    if (typeof object === 'undefined') {
      throw new Error(`${level}: 'object' cannot be 'undefined'`);
    }
    if (typeof schema === 'undefined') {
      throw new Error(`${level}: 'schema' cannot be 'undefined'`);
    }
    for (const key in schema) {
      if (typeof object[key] === 'undefined') {
        if (schema[key].__required === true) {
          throw new Error(`${level}: Object is missing property '${key}'.`);
        }
      } else {
        if (object[key] instanceof Array) {
          if (schema[key].__type === 'array') {
            if (object[key].length > 0) {
              if (typeof object[key][0] === 'object') {
                if (schema[key].__child.__type !== 'object') {
                  throw new Error(
                    `${level}: Type mismatch at '${key}'. Expected '${schema[key].__child.__type}' but got 'object'.`,
                  );
                }
                // tslint:disable-next-line: forin
                for (const i in object[key]) {
                  ObjectUtility.compareWithSchema(
                    object[key][i],
                    schema[key].__child.__content,
                    level + `.${key}`,
                  );
                }
              } else {
                const checkType = object[key].find(
                  e => typeof e !== schema[key].__child.__type,
                );
                if (checkType) {
                  throw new Error(
                    `${level}: Type mismatch found in an array '${key}'. Expected '${
                      schema[key].__child.__type
                    }' but got a '${typeof checkType}'.`,
                  );
                }
              }
            }
          } else {
            throw new Error(
              `${level}: Type mismatch of property '${key}'. Expected 'object.array' but got '${typeof object[
                key
              ]}'.`,
            );
          }
        } else {
          if (typeof object[key] !== schema[key].__type) {
            throw new Error(
              `${level}: Type mismatch of property '${key}'. Expected '${
                schema[key].__type
              }' but got '${typeof object[key]}'.`,
            );
          }
          if (schema[key].__type === 'object') {
            ObjectUtility.compareWithSchema(
              object[key],
              schema[key].__child,
              level + `.${key}`,
            );
          }
        }
      }
    }
  }

  /**
   * Converts object schema to JavaScript object.
   *
   * @param schema Schema of an Object
   * @param level Since function is recursive, level indicates
   *    what property is being converted. Used for throwing errors.
   */
  public static schemaToObject(schema: any, level?: string): any {
    if (!level) {
      level = 'root';
    }
    const object: any = ObjectUtility.typeToValue(schema.__type);
    if (schema.__type === 'object') {
      // tslint:disable-next-line:forin
      for (const key in schema.__child) {
        object[key] = ObjectUtility.schemaToObject(
          schema.__child[key],
          `level.${key}`,
        );
      }
    }
    return object;
  }

  /**
   * Converts property type to its value.
   */
  private static typeToValue(type: string): any {
    switch (type) {
      case 'object': {
        return {};
      }
      case 'array': {
        return [];
      }
      case 'string': {
        return '';
      }
      case 'number': {
        return 0;
      }
      case 'boolean': {
        return false;
      }
    }
    return undefined;
  }

  /**
   * Generate a schema object based on object that is parsed. Will
   * throw an error with a message if problem is detected. Use
   * this method in a try-catch block.
   *
   * @param object Based on this object, schema will be generated.
   * @param level Property that is converted.
   */
  public static generateSchema(object: any, level?: string): any {
    if (!level) {
      level = 'root';
    }
    if (!object) {
      return undefined;
    }
    let schema = {};
    if (typeof object !== 'object') {
      schema = {
        __required: true,
        __type: typeof object,
      };
    } else {
      for (const key in object) {
        if (typeof object[key] === 'object') {
          if (object[key] instanceof Array) {
            if (object[key].length > 0) {
              let childType = 'unknown';
              // tslint:disable-next-line: forin
              for (const childKey in object[key]) {
                childType = typeof object[key][childKey];
                break;
              }
              if (childType === 'object') {
                schema[key] = {
                  __required: true,
                  __type: 'array',
                  __child: {
                    __type: childType,
                    __content: ObjectUtility.generateSchema(
                      object[key][0],
                      level + `.${key}`,
                    ),
                  },
                };
              } else {
                schema[key] = {
                  __required: true,
                  __type: 'array',
                  __child: {
                    __type: childType,
                  },
                };
              }
            } else {
              throw new Error(
                `${level}: Cannot create schema from empty array.`,
              );
            }
          } else {
            let childType = 'unknown';
            // tslint:disable-next-line: forin
            for (const childKey in object[key]) {
              childType = typeof object[key][childKey];
              break;
            }
            if (childType === 'object') {
              schema[key] = {
                __required: true,
                __type: 'array',
                __child: {
                  __type: childType,
                  __content: ObjectUtility.generateSchema(
                    object[key],
                    level + `.${key}`,
                  ),
                },
              };
            } else {
              schema[key] = {
                __required: true,
                __type: childType,
              };
            }
          }
        } else {
          schema[key] = {
            __required: true,
            __type: typeof object[key],
          };
        }
      }
    }
    return schema;
  }
}
