import { ConnectionOptions } from 'typeorm';

import { ExecutorTestBed } from '../../mocks/executor';
import { TypeormProject } from '../typeorm-project';

import { DatabaseServiceDriver } from './database-service-driver';
import { PostgresDriver } from './postgres';

// Setup
const testBed = new ExecutorTestBed();

beforeEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  testBed.setupMocks();
});

// Test suites
describe('DatabaseServiceDriver.register', () => {
  let drivers: typeof DatabaseServiceDriver.drivers;

  beforeEach(() => {
    drivers = DatabaseServiceDriver.drivers;
    DatabaseServiceDriver.drivers = {};
  });

  afterEach(() => {
    DatabaseServiceDriver.drivers = drivers;
  });

  // Tests
  it('should register a driver', () => {
    @DatabaseServiceDriver.register('postgres')
    class TestDriver extends DatabaseServiceDriver {
      databaseExists(): Promise<boolean> {
        return Promise.resolve(false);
      }

      createDatabase(): Promise<void> {
        return Promise.resolve(undefined);
      }
    }

    // Check
    expect(DatabaseServiceDriver.drivers).toEqual({
      postgres: TestDriver
    });
  });
});

describe('DatabaseServiceDriver.connect', () => {
  beforeEach(() => {
    (DatabaseServiceDriver.connect as jest.MockedFunction<typeof DatabaseServiceDriver.connect>)
      .mockRestore();
  });

  // Tests
  it('should create a driver instance with a connection', async () => {
    await expect(DatabaseServiceDriver.connect(
      testBed.context.typeormProject as unknown as TypeormProject,
      testBed.options as ConnectionOptions
    )).resolves.toBeInstanceOf(PostgresDriver);

    // Checks
    expect(testBed.context.typeormProject.createConnection)
      .toHaveBeenCalledWith({ ...testBed.options, database: PostgresDriver.defaultDatabase });
  });

  it('should request options', async () => {
    await expect(DatabaseServiceDriver.connect(
      testBed.context.typeormProject as unknown as TypeormProject,
      testBed.options.name
    )).resolves.toBeInstanceOf(PostgresDriver);

    // Checks
    expect(testBed.context.typeormProject.getOptions)
      .toHaveBeenCalledWith(testBed.options.name);

    expect(testBed.context.typeormProject.createConnection)
      .toHaveBeenCalledWith({ ...testBed.options, database: PostgresDriver.defaultDatabase });
  });

  it('should throw unsupported database', async () => {
    await expect(DatabaseServiceDriver.connect(
      testBed.context.typeormProject as unknown as TypeormProject,
      { ...testBed.options, type: 'test' } as unknown as ConnectionOptions
    )).rejects.toEqual(new Error('Unsupported database type test'));

    // Checks
    expect(testBed.context.typeormProject.getOptions)
      .not.toHaveBeenCalled();

    expect(testBed.context.typeormProject.createConnection)
      .not.toHaveBeenCalled();
  });
});
