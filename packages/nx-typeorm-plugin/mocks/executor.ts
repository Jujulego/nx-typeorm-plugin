import { Executor } from '@nrwl/devkit';
import { Connection } from 'typeorm';

import { DatabaseServiceDriver } from '../src/drivers';
import { ConnectionDatabase } from '../src/drivers/database-service-driver';
import { TypeormExecutor, TypeormExecutorContext } from '../src/executors/wrapper';

// Test bed
export class ExecutorTestBed {
  // Attributes
  database = 'test';

  options = {
    name: this.database,
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'test',
    username: 'root',
    password: 'root'
  };

  connection = {
    options: this.options,
    runMigrations: jest.fn(),
    query: jest.fn(),
    close: jest.fn()
  };

  driver = (() => {
    const connection = this.connection as unknown as Connection;

    return new class extends DatabaseServiceDriver {
      constructor() {
        super(connection);
      }

      databaseExists = jest.fn<Promise<boolean>, [ConnectionDatabase]>();
      createDatabase = jest.fn<Promise<void>, [ConnectionDatabase]>();
      close = jest.fn<Promise<void>, []>();
    }
  })();

  context = {
    typeormProject: {
      getOptions: jest.fn(),
      createConnection: jest.fn()
    }
  };

  // Methods
  setupMocks() {
    jest.spyOn(DatabaseServiceDriver, 'connect')
      .mockResolvedValue(this.driver);

    this.driver.databaseExists.mockResolvedValue(true);
    this.context.typeormProject.getOptions.mockResolvedValue(this.options);
    this.context.typeormProject.createConnection.mockResolvedValue(this.connection);
  }

  callExecutor<O, R extends ReturnType<Executor<O>>>(executor: TypeormExecutor<O, R>, options: O): R {
    return executor(options, this.context as unknown as TypeormExecutorContext);
  }
}
