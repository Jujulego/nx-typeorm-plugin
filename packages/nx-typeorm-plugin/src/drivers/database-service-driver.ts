import { Connection, ConnectionOptions } from 'typeorm';
import { TypeormProject } from '../typeorm-project';

// Types
export type ConnectionType = ConnectionOptions['type'];
export type ConnectionDatabase = Exclude<ConnectionOptions['database'], undefined>;
export type DriverClass = typeof DatabaseServiceDriver & { new (connection: Connection): DatabaseServiceDriver };

// Model
export abstract class DatabaseServiceDriver {
  // Constructor
  constructor(protected readonly connection: Connection) {}

  // Statics
  static defaultDatabase: ConnectionDatabase;
  static drivers: Partial<Record<ConnectionOptions['type'], DriverClass>> = {};

  static register<D extends DriverClass>(type: ConnectionType) {
    return function (driver: D) {
      DatabaseServiceDriver.drivers[type] = driver;

      return driver;
    }
  }

  private static getDriver(type: ConnectionType): DriverClass {
    const driver = this.drivers[type];

    if (!driver) {
      throw new Error(`Unsupported database type ${type}`);
    }

    return driver;
  }

  static async connect(project: TypeormProject, options?: string | ConnectionOptions): Promise<DatabaseServiceDriver> {
    // Get options
    if (!options || typeof options === 'string') {
      options = await project.getOptions(options);
    }

    // Get driver
    const driver = this.getDriver(options.type);
    options = { ...options, database: driver?.defaultDatabase } as ConnectionOptions;

    // Connect to the server
    const connection = await project.createConnection(options);

    return new driver(connection);
  }

  // Methods
  abstract databaseExists(database?: ConnectionDatabase): Promise<boolean>;
  abstract createDatabase(database?: ConnectionDatabase): Promise<void>;

  async close(): Promise<void> {
    await this.connection.close();
  }

  // Properties
  get options(): ConnectionOptions {
    return this.connection.options;
  }
}
