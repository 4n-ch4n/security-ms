import { IRoleRepository } from '@domain/repositories';
import { Role } from '@domain/value-objects';
import { IMysql } from './config';
import { QueryBuilder } from '@config/utils';
import { RowDataPacket } from 'mysql2';
import { IRoleModel } from '../models/IRoleModel';

export class RoleRepository implements IRoleRepository {
  private mysqlEntity: string = 'roles';

  constructor(private db: IMysql) {}

  async getRoles(): Promise<Role[]> {
    const query = new QueryBuilder(this.mysqlEntity).build();

    const [rows] = await this.db.mysqlDb.execute<IRoleModel & RowDataPacket[]>(
      query,
    );

    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
    }));
  }

  async getPermissionsByRoleId(roleId: string): Promise<string[]> {
    const query = new QueryBuilder(this.mysqlEntity)
        .setColumns(`p.code AS permission_code`)
        .addJoin(`INNER JOIN role_has_permissions rhp ON (${this.mysqlEntity}.id = rhp.rol_id)`)
        .addJoin(`INNER JOIN permissions p ON (rhp.permission_id = p.id)`)
        .addCondition(`${this.mysqlEntity}.id = ?`)
        .build();

    const [rows] = await this.db.mysqlDb.execute<RowDataPacket[]>(query, [roleId]);

    return rows.map((row) => row.permission_code);
  }
}
