import { ConnectionDatabase, DatabaseServiceDriver } from './database-service-driver';

// Class
@DatabaseServiceDriver.register('mysql')
export class MysqlDriver extends DatabaseServiceDriver {
  // Statics
  static defaultDatabase: ConnectionDatabase = 'mysql';

  // Methods
  async databaseExists(database = 'mysql'): Promise<boolean> {
    const [{ count }] = await this.connection.query(
      'select count(distinct SCHEMA_NAME) as count from information_schema.SCHEMATA where SCHEMA_NAME=?',
      [database]
    );

    return count !== '0';
  }

  async createDatabase(database: ConnectionDatabase): Promise<void> {
    await this.connection.query('create database ??', [database]);
  }
}
