import { IPermission, Permission } from './jwt-permission.model';

export enum RoleName {
  SUDO = 'SUDO',
  DEV = 'DEV',

  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',

  EDITOR = 'EDITOR',
  SUPPORT = 'SUPPORT',
  USER = 'USER',
  GUEST = 'GUEST',
}

export interface IRole {
  name: RoleName;
  permissions: IPermission[];
}

export class Role implements IRole {
  constructor(public name: RoleName, public permissions: Permission[]) {}
}
