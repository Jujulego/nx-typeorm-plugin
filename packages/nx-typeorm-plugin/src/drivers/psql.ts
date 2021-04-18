import { ConnectionDatabase, DatabaseServiceDriver } from './database-service-driver';

// Class
@DatabaseServiceDriver.register('postgres')
export class PsqlDriver extends DatabaseServiceDriver {
  // Statics
  static defaultDatabase: ConnectionDatabase = 'postgres';

  // Methods
  async databaseExists(database = 'postgres'): Promise<boolean> {
    const [{ count }] = await this.connection.query(
      `select count(distinct datname) as count from pg_database where datname = $1`,
      [database]
    );

    return count !== '0';
  }

  async createDatabase(database = 'postgres'): Promise<void> {
    await this.connection.query(`create database "${database}"`);
  }
}
