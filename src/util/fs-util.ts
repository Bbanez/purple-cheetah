import * as util from 'util';
import * as path from 'path';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';

export class FSUtil {
  private static base = '';

  public static async save(data: string | Buffer, root: string) {
    const parts = root.split('/');
    let base: string = `${FSUtil.base}`;
    // tslint:disable-next-line: prefer-for-of
    for (let j = 0; j < parts.length; j = j + 1) {
      if (parts[j].indexOf('.') === -1) {
        base = path.join(base, parts[j]);
        try {
          if ((await util.promisify(fs.exists)(base)) === false) {
            await util.promisify(fs.mkdir)(base);
          }
        } catch (error) {
          // tslint:disable-next-line:no-console
          console.log(`Failed to create directory '${base}'`);
        }
      }
    }
    await util.promisify(fs.writeFile)(
      path.join(base, parts[parts.length - 1]),
      data,
    );
  }

  public static async mkdir(root: string, isAbsolute?: boolean) {
    const parts = root.split('/');
    let base: string = `${FSUtil.base}`;
    // tslint:disable-next-line: prefer-for-of
    for (let j = 0; j < parts.length; j = j + 1) {
      if (parts[j].indexOf('.') === -1) {
        base = path.join(base, parts[j]);
        try {
          if ((await util.promisify(fs.exists)(base)) === false) {
            await util.promisify(fs.mkdir)(base);
          }
        } catch (error) {
          // tslint:disable-next-line:no-console
          console.log(`Failed to create directory '${base}'`);
        }
      }
    }
  }

  public static async read(root: string) {
    return await util.promisify(fs.readFile)(path.join(FSUtil.base, root));
  }

  public static async exist(root: string) {
    return await util.promisify(fs.exists)(path.join(FSUtil.base, root));
  }

  public static async deleteFile(root: string) {
    await util.promisify(fs.unlink)(path.join(FSUtil.base, root));
  }

  public static async deleteDir(root: string) {
    await fsExtra.remove(path.join(FSUtil.base, root));
  }

  public static async rename(oldRoot: string, newRoot: string) {
    await util.promisify(fs.rename)(
      path.join(FSUtil.base, oldRoot),
      path.join(FSUtil.base, newRoot),
    );
  }
}
