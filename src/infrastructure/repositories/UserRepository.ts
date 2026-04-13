import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { User } from '@domain/entities';
import { IUserRepository } from '@domain/repositories';
import { PaginationQuery, PaginatedResult } from '@domain/value-objects';
import { dynamicFieldsToUpdate, QueryBuilder } from '@config/utils';
import { UserMapper } from '@config/utils/mappers';
import { IMysql } from './config';

export class UserRepository implements IUserRepository {
  private mysqlEntity: string = 'users';

  constructor(private db: IMysql) {}

  async getUserById(id: string): Promise<User | null> {
    const query = new QueryBuilder(this.mysqlEntity)
      .setColumns(
        `${this.mysqlEntity}.*, uo.id AS user_org_id, uo.company_id, uo.joined_at,
        r.id AS role_id, r.name AS role_name, r.description AS role_description,
        p.code AS permission_code`,
      )
      .addJoin(
        `LEFT JOIN user_organizations uo ON (${this.mysqlEntity}.id = uo.user_id)`,
      )
      .addJoin(`LEFT JOIN roles r ON (uo.rol_id = r.id)`)
      .addJoin(`LEFT JOIN role_has_permissions rhp ON (r.id = rhp.rol_id)`)
      .addJoin(`LEFT JOIN permissions p ON (rhp.permission_id = p.id)`)
      .addCondition(`${this.mysqlEntity}.id = ?`)
      .build();

    const [rows] = await this.db.mysqlDb.execute<RowDataPacket[]>(query, [id]);

    return UserMapper.mapUserModelToEntity(rows)[0] || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const query = new QueryBuilder(this.mysqlEntity)
      .setColumns(
        `${this.mysqlEntity}.*, uo.id AS user_org_id, uo.company_id, uo.joined_at,
        r.id AS role_id, r.name AS role_name, r.description AS role_description,
        p.code AS permission_code`,
      )
      .addJoin(
        `LEFT JOIN user_organizations uo ON (${this.mysqlEntity}.id = uo.user_id)`,
      )
      .addJoin(`LEFT JOIN roles r ON (uo.rol_id = r.id)`)
      .addJoin(`LEFT JOIN role_has_permissions rhp ON (r.id = rhp.rol_id)`)
      .addJoin(`LEFT JOIN permissions p ON (rhp.permission_id = p.id)`)
      .addCondition(`${this.mysqlEntity}.email = ?`)
      .build();

    const [rows] = await this.db.mysqlDb.execute<RowDataPacket[]>(query, [
      email,
    ]);

    return UserMapper.mapUserModelToEntity(rows)[0] || null;
  }

  async getUsersByOrganization(
    companyId: string,
    pagination: PaginationQuery,
  ): Promise<PaginatedResult<User>> {
    const query = new QueryBuilder(this.mysqlEntity)
      .setColumns(
        `${this.mysqlEntity}.*, GROUP_CONCAT(uo.id) AS user_org_ids, 
        GROUP_CONCAT(uo.company_id) AS companies_ids, GROUP_CONCAT(uo.joined_at) AS joined_ats,
        GROUP_CONCAT(r.id) AS role_ids, GROUP_CONCAT(r.name) AS role_names, 
        GROUP_CONCAT(r.description) AS role_descriptions, GROUP_CONCAT(p.code) AS permission_codes`,
      )
      .addJoin(
        `LEFT JOIN user_organizations uo ON (${this.mysqlEntity}.id = uo.user_id)`,
      )
      .addJoin(`LEFT JOIN roles r ON (uo.rol_id = r.id)`)
      .addJoin(`LEFT JOIN role_has_permissions rhp ON (r.id = rhp.rol_id)`)
      .addJoin(`LEFT JOIN permissions p ON (rhp.permission_id = p.id)`)
      .addCondition('uo.company_id = ?')
      .setLimit({ page: pagination.offset, limit: pagination.limit })
      .setGroupBy(`${this.mysqlEntity}.id`)
      .build();

    const [rows] = await this.db.mysqlDb.execute<RowDataPacket[]>(query, [
      companyId,
    ]);

    const users = UserMapper.mapUserModelToEntity(rows);

    const totalRowsQuery = new QueryBuilder(this.mysqlEntity)
      .setColumns(`COUNT(DISTINCT ${this.mysqlEntity}.id) AS total`)
      .addJoin(
        `LEFT JOIN user_organizations uo ON (${this.mysqlEntity}.id = uo.user_id)`,
      )
      .addJoin(`LEFT JOIN roles r ON (uo.rol_id = r.id)`)
      .addJoin(`LEFT JOIN role_has_permissions rhp ON (r.id = rhp.rol_id)`)
      .addJoin(`LEFT JOIN permissions p ON (rhp.permission_id = p.id)`)
      .addCondition('uo.company_id = ?')
      .build();

    const [totalRows] = await this.db.mysqlDb.execute<RowDataPacket[]>(
      totalRowsQuery,
      [companyId],
    );

    return {
      data: users,
      total: totalRows[0]['total'] as number,
    };
  }

  async createUser(user: User, connection?: PoolConnection): Promise<void> {
    const db = connection || this.db.mysqlDb;

    const userToSave = UserMapper.mapUserEntityToModel(user);
    await db.query(`INSERT INTO ${this.mysqlEntity} SET ?`, [userToSave]);
  }

  async updateUser(user: User, connection?: PoolConnection): Promise<void> {
    const db = connection || this.db.mysqlDb;

    const userToUpdate = UserMapper.mapUserEntityToModel(user);

    const [fieldsToUpdate, valuesToUpdate] = dynamicFieldsToUpdate(
      userToUpdate,
      'id',
    );
    await db.query(
      `UPDATE ${this.mysqlEntity} SET ${fieldsToUpdate.join(', ')} WHERE id = ?`,
      valuesToUpdate,
    );
  }

  async deleteUser(id: string, connection?: PoolConnection): Promise<void> {
    const db = connection || this.db.mysqlDb;

    await db.query(`UPDATE ${this.mysqlEntity} SET is_active = false WHERE id = ?`, [id]);
  }
}
