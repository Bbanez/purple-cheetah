import { IHiveSocketUser } from './hive-socket-user.interface';

export interface IHiveSocketUserService {
  findById: (id: string) => Promise<IHiveSocketUser | null>;
}
