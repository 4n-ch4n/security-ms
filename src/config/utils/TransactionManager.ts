import { IMysql } from '@infrastructure/repositories/config';
import { PoolConnection } from 'mysql2/promise';

export class TransactionManager {
  private connection!: PoolConnection;

  constructor(private db: IMysql) {}

  async beginTransaction(): Promise<void> {
    this.connection = await this.db.mysqlDb.getConnection();
    await this.connection.beginTransaction();
  }

  async commit(): Promise<void> {
    await this.connection.commit();
    this.connection.release();
  }

  async rollback(): Promise<void> {
    await this.connection.rollback();
    this.connection.release();
  }

  async executeInTransaction<T>(
    fn: (conn: PoolConnection) => Promise<T>,
  ): Promise<T> {
    await this.beginTransaction();
    try {
      const result = await fn(this.connection);
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }
}
