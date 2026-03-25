import { envs } from '@config';
import { createPool, Pool } from 'mysql2/promise';

export interface IMysql {
  mysqlDb: Pool;
}

export class MysqlConfig implements IMysql {
  private db: Pool;

  constructor(private environments: typeof envs) {
    this.db = createPool({
      host: this.environments.mysql.host,
      port: this.environments.mysql.port,
      user: this.environments.mysql.user,
      password: this.environments.mysql.password,
      database: this.environments.mysql.database,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }

  public get mysqlDb(): Pool {
    return this.db;
  }
}
