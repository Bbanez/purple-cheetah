import { MiracleUser } from '../models/miracle-user.model';

export class MiracleUserService {
  private static users: MiracleUser[] = [];

  public findAll(): MiracleUser[] {
    return [...MiracleUserService.users];
  }

  public findAllByKey(keys: string[]): MiracleUser[] {
    return [
      ...MiracleUserService.users.filter(user => {
        return keys.find(key => key === user.key) ? true : false;
      }),
    ];
  }

  public findByKey(key: string): MiracleUser | null {
    const user = MiracleUserService.users.find(e => e.key === key);
    return user ? user : null;
  }

  public add(user: MiracleUser): void {
    MiracleUserService.users.push(user);
  }

  public addMany(users: MiracleUser[]): void {
    MiracleUserService.users = [...MiracleUserService.users, ...users];
  }

  public deleteByKey(key: string) {
    MiracleUserService.users = MiracleUserService.users.filter(
      e => e.key !== key,
    );
  }

  public deleteAddByKey(keys: string[]) {
    MiracleUserService.users = MiracleUserService.users.filter(user => {
      return keys.find(key => key === user.key) ? false : true;
    });
  }
}
