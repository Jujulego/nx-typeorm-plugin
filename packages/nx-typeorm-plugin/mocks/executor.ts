import { Executor } from '@nrwl/devkit';

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
    runMigrations: jest.fn(),
    query: jest.fn(),
    close: jest.fn()
  };

  context = {
    typeormProject: {
      getOptions: jest.fn(),
      createConnection: jest.fn()
    }
  };

  // Methods
  setupMocks() {
    this.context.typeormProject.getOptions.mockResolvedValue(this.options);
    this.context.typeormProject.createConnection.mockResolvedValue(this.connection);
  }

  callExecutor<O, R extends ReturnType<Executor<O>>>(executor: TypeormExecutor<O, R>, options: O): R {
    return executor(options, this.context as unknown as TypeormExecutorContext);
  }
}
