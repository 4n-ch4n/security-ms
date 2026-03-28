import { IUserOrganizationRepository } from '@domain/repositories';
import { UserOrganization } from '@domain/value-objects';
import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { IMysql } from './config';
import { IUserOrganizationModel } from '@infrastructure/models';
import { QueryBuilder } from '@config/utils';

export class UserOrganizationRepository implements IUserOrganizationRepository {
  private mysqlEntity: string = 'user_organizations';

  constructor(private db: IMysql) {}

  async assignUserToOrganization(
    userOrganization: UserOrganization,
    connection?: PoolConnection,
  ): Promise<void> {
    const db = connection || this.db.mysqlDb;

    const organizationToSave: IUserOrganizationModel = {
      id: userOrganization.id,
      userId: userOrganization.userId,
      companyId: userOrganization.companyId,
      rolId: userOrganization.role.id,
      joinedAt: userOrganization.joinedAt,
    };

    await db.query(`INSERT INTO ${this.mysqlEntity} SET ?`, [
      organizationToSave,
    ]);
  }

  async removeUserFromOrganization(
    userId: string,
    companyId: string,
    connection?: PoolConnection,
  ): Promise<void> {
    const db = connection || this.db.mysqlDb;

    await db.query(
      `DELETE FROM ${this.mysqlEntity} WHERE user_id = ? AND company_id = ?`,
      [userId, companyId],
    );
  }

  async getUserOrganizations(userId: string): Promise<UserOrganization[]> {
    const query = new QueryBuilder(this.mysqlEntity)
      .setColumns(
        `${this.mysqlEntity}.*, r.id AS role_id, r.name AS role_name, r.description AS role_description`,
      )
      .addJoin(`JOIN roles r ON (${this.mysqlEntity}.rol_id = r.id)`)
      .addCondition(`${this.mysqlEntity}.user_id = ?`)
      .build();

    const [rows] = await this.db.mysqlDb.execute<RowDataPacket[]>(query, [
      userId,
    ]);

    const organizations: UserOrganization[] = rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      companyId: row.companyId,
      role: {
        id: row.role_id,
        name: row.role_name,
        description: row.role_description,
      },
      joinedAt: row.joinedAt,
    }));

    return organizations;
  }

  async assignRoleToUser(
    userId: string,
    companyId: string,
    roleId: string,
    connection?: PoolConnection,
  ): Promise<void> {
    const db = connection || this.db.mysqlDb;

    await db.query(
      `UPDATE ${this.mysqlEntity} SET rol_id = ? WHERE user_id = ? AND company_id = ?`,
      [roleId, userId, companyId],
    );
  }
}
