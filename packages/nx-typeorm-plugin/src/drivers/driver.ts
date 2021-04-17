import { Connection, ConnectionOptions } from 'typeorm';

// Types
export type ConnectionType = ConnectionOptions['type'];
export type ConnectionDatabase = Exclude<ConnectionOptions['database'], undefined>;
export type DriverClass = typeof Driver & { new (connection: Connection): Driver };

// Model
export abstract class Driver {
  // Constructor
  constructor(protected readonly connection: Connection) {}

  // Statics
  static defaultDatabase: ConnectionDatabase;
  static drivers: Partial<Record<ConnectionOptions['type'], DriverClass>> = {};

  static register<D extends DriverClass>(type: ConnectionType) {
    return function (driver: D) {
      Driver.drivers[type] = driver;

      return driver;
    }
  }

  static isSupported(type: ConnectionType): boolean {
    return !!this.drivers[type];
  }

  private static getDriver(type: ConnectionType): DriverClass {
    const driver = this.drivers[type];

    if (!driver) {
      throw new Error(`Unsupported database type ${type}`);
    }

    return driver;
  }

  static adaptOptions(options: ConnectionOptions): ConnectionOptions {
    const driver = this.getDriver(options.type);
    return { ...options, database: driver.defaultDatabase } as ConnectionOptions;
  }

  static buildDriver(connection: Connection): Driver {
    const driver = this.getDriver(connection.options.type);
    return new driver(connection);
  }

  // Methods
  abstract databaseExists(database?: ConnectionDatabase): Promise<boolean>;
  abstract createDatabase(database?: ConnectionDatabase): Promise<void>;
}
