import { createPool, Pool } from 'mysql2/promise';
import { envs } from '@config';

export interface IMysql {
  mysqlDb: Pool;
}

export class MysqlConfig implements IMysql {
  private static instance: MysqlConfig;
  private db: Pool;

  private constructor(private environments: typeof envs) {
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

  public static getInstance(environments: typeof envs): MysqlConfig {
    if (!MysqlConfig.instance) {
      MysqlConfig.instance = new MysqlConfig(environments);
    }
    return MysqlConfig.instance;
  }

  public get mysqlDb(): Pool {
    return this.db;
  }
}
