import { RoleName } from '../jwt-role.model';

export class RoleFactory {
  public static get allRoleNames(): RoleName[] {
    return [RoleName.USER, RoleName.SUDO];
  }
}
