import { Role } from '../value-objects';

export interface IRoleRepository {
  getRoles(): Promise<Role[]>;
  getPermissionsByRoleId(roleId: string): Promise<string[]>;
}
