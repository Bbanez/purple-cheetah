import { Permission } from './jwt-permission.interface';

export enum RoleName {
  SUDO = 'SUDO',
  DEV = 'DEV',

  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  SERVICE = 'SERVICE',

  EDITOR = 'EDITOR',
  SUPPORT = 'SUPPORT',
  USER = 'USER',
  GUEST = 'GUEST',
}

export interface Role {
  name: RoleName;
  permissions: Permission[];
}
