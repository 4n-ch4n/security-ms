import { PoolConnection } from 'mysql2/promise';
import { UserOrganization } from '../value-objects';

export interface IUserOrganizationRepository {
  assignUserToOrganization(
    userOrganization: UserOrganization,
    connection?: PoolConnection,
  ): Promise<void>;
  removeUserFromOrganization(
    userId: string,
    companyId: string,
    connection?: PoolConnection,
  ): Promise<void>;
  getUserOrganizations(userId: string): Promise<UserOrganization[]>;
  assignRoleToUser(
    userId: string,
    companyId: string,
    roleId: string,
    connection?: PoolConnection,
  ): Promise<void>;
  deleteUserRoles(userId: string, connection?: PoolConnection): Promise<void>;
}
