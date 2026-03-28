import { PoolConnection } from 'mysql2/promise';
import { User } from '../entities/User';
import { PaginatedResult, PaginationQuery } from '../value-objects';

export interface IUserRepository {
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUsersByOrganization(
    organizationId: string,
    pagination: PaginationQuery,
  ): Promise<PaginatedResult<User>>;
  createUser(user: User, connection?: PoolConnection): Promise<void>;
  updateUser(user: User, connection?: PoolConnection): Promise<void>;
  deleteUser(id: string, connection?: PoolConnection): Promise<void>;
}
