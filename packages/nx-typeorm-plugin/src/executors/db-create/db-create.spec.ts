import { logger } from '../../logger';
import { TypeormExecutorContext } from '../wrapper';

import { dbCreate } from './executor';

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
  query: jest.fn(),
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
describe('db-create executor', () => {
  // Tests
  it('should fail (unsupported database type)', async () => {
    ctx.typeormProject.getOptions
      .mockResolvedValue({
        ...options,
        type: 'mysql'
      });

    // Call
    await expect(dbCreate({ database }, ctx as unknown as TypeormExecutorContext))
      .resolves.toEqual({
        success: false
      });

    // Checks
    expect(ctx.typeormProject.getOptions).toHaveBeenCalledWith(database);
    expect(ctx.typeormProject.createConnection).not.toHaveBeenCalled();

    expect(logger.error).toHaveBeenCalledWith('Unsupported database type mysql');
  });

  it('should create database and succeed', async () => {
    connection.query.mockResolvedValue([{ count: '0' }]);

    // Call
    await expect(dbCreate({ database }, ctx as unknown as TypeormExecutorContext))
      .resolves.toEqual({
        success: true
      });

    // Checks
    expect(ctx.typeormProject.getOptions).toHaveBeenCalledWith(database);
    expect(ctx.typeormProject.createConnection).toHaveBeenCalledWith({ ...options, database: 'postgres' });

    expect(connection.query).toBeCalledTimes(2);
    expect(connection.query).toHaveBeenCalledWith(`select count(distinct datname) as count from pg_database where datname = $1`, ['test']);
    expect(connection.query).toHaveBeenCalledWith(`create database "${options.database}"`);

    expect(logger.succeed).toHaveBeenCalledWith(expect.stringContaining('test'));

    expect(connection.close).toBeCalled();
  });

  it('should do nothing and succeed', async () => {
    connection.query.mockResolvedValue([{ count: '1' }]);

    // Call
    await expect(dbCreate({ database }, ctx as unknown as TypeormExecutorContext))
      .resolves.toEqual({
        success: true
      });

    // Checks
    expect(ctx.typeormProject.getOptions).toHaveBeenCalledWith(database);
    expect(ctx.typeormProject.createConnection).toHaveBeenCalledWith({ ...options, database: 'postgres' });

    expect(connection.query).toBeCalledTimes(1);
    expect(connection.query).toHaveBeenCalledWith(
      `select count(distinct datname) as count from pg_database where datname = $1`,
      [options.database]
    );

    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining(options.database));

    expect(connection.close).toBeCalled();
  });
});
