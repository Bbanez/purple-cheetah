export enum PermissionName {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  EXECUTE = 'EXECUTE',
}

export interface IPermission {
  name: PermissionName;
}

export class Permission implements IPermission {
  constructor(public name: PermissionName) {}
}