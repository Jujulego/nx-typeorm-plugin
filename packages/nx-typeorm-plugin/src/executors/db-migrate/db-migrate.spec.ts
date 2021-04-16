import { logger } from '../../logger';
import { TypeormExecutorContext } from '../wrapper';

import { dbMigrate } from './executor';

// Constants
const database = 'test';

const options = {
  name: database,
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'test',
  username: 'root',
  password: 'root'
};

const connection = {
  runMigrations: jest.fn(),
  close: jest.fn()
};

const ctx = {
  typeormProject: {
    getOptions: jest.fn(),
    createConnection: jest.fn()
  }
};

// Setup
jest.mock('../../logger');
jest.mock('../../typeorm-project');

beforeEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  // Default mocks
  ctx.typeormProject.getOptions.mockResolvedValue(options);
  ctx.typeormProject.createConnection.mockResolvedValue(connection);
});

// Suite
describe('db-migrate executor', () => {
  // Tests
  it('should fail (unsupported database type)', async () => {
    ctx.typeormProject.getOptions
      .mockResolvedValue({
        ...options,
        type: 'mysql'
      });

    // Call
    await expect(dbMigrate({ database }, ctx as unknown as TypeormExecutorContext))
      .resolves.toEqual({
        success: false
      });

    // Checks
    expect(ctx.typeormProject.getOptions).toHaveBeenCalledWith(database);
    expect(ctx.typeormProject.createConnection).not.toHaveBeenCalled();

    expect(logger.error).toHaveBeenCalledWith('Unsupported database type mysql');
  });

  it('should run, print migrations and succeed', async () => {
    connection.runMigrations.mockResolvedValue([{ name: 'TestMigration' }]);

    // Call
    await expect(dbMigrate({ database }, ctx as unknown as TypeormExecutorContext))
      .resolves.toEqual({
        success: true
      });

    // Checks
    expect(ctx.typeormProject.getOptions).toHaveBeenCalledWith(database);
    expect(ctx.typeormProject.createConnection).toHaveBeenCalledWith(options);

    expect(connection.runMigrations).toHaveBeenCalledWith({ transaction: 'each' });

    expect(logger.succeed).toHaveBeenCalledWith(expect.stringContaining('TestMigration'));

    expect(connection.close).toBeCalled();
  });

  it('should do nothing and succeed', async () => {
    connection.runMigrations.mockResolvedValue([]);

    // Call
    await expect(dbMigrate({ database }, ctx as unknown as TypeormExecutorContext))
      .resolves.toEqual({
        success: true
      });

    // Checks
    expect(ctx.typeormProject.getOptions).toHaveBeenCalledWith(database);
    expect(ctx.typeormProject.createConnection).toHaveBeenCalledWith(options);

    expect(connection.runMigrations).toHaveBeenCalledWith({ transaction: 'each' });

    expect(logger.info).toBeCalled();

    expect(connection.close).toBeCalled();
  });
});
