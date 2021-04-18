import { logger } from '../../logger';
import { ExecutorTestBed } from '../../../mocks/executor';

import { dbCreate } from './executor';

// Setup
const testBed = new ExecutorTestBed();

jest.mock('../../logger');
jest.mock('../../typeorm-project');

beforeEach(() => {
  // Mocks
  jest.resetAllMocks();
  jest.restoreAllMocks();

  testBed.setupMocks();
});

// Suite
describe('db-create executor', () => {
  // Tests
  it('should create database and succeed', async () => {
    testBed.connection.query.mockResolvedValue([{ count: '0' }]);

    // Call
    await expect(testBed.callExecutor(dbCreate, { database: testBed.database }))
      .resolves.toEqual({
        success: true
      });

    // Checks
    expect(testBed.context.typeormProject.getOptions).toHaveBeenCalledWith(testBed.database);
    expect(testBed.context.typeormProject.createConnection).toHaveBeenCalledWith({ ...testBed.options, database: 'postgres' });

    expect(testBed.connection.query).toBeCalledTimes(2);
    expect(testBed.connection.query).toHaveBeenCalledWith(`select count(distinct datname) as count from pg_database where datname = $1`, ['test']);
    expect(testBed.connection.query).toHaveBeenCalledWith(`create database "${testBed.options.database}"`);

    expect(logger.succeed).toHaveBeenCalledWith(expect.stringContaining('test'));

    expect(testBed.connection.close).toBeCalled();
  });

  it('should do nothing and succeed', async () => {
    testBed.connection.query.mockResolvedValue([{ count: '1' }]);

    // Call
    await expect(testBed.callExecutor(dbCreate, { database: testBed.database }))
      .resolves.toEqual({
        success: true
      });

    // Checks
    expect(testBed.context.typeormProject.getOptions).toHaveBeenCalledWith(testBed.database);
    expect(testBed.context.typeormProject.createConnection).toHaveBeenCalledWith({ ...testBed.options, database: 'postgres' });

    expect(testBed.connection.query).toBeCalledTimes(1);
    expect(testBed.connection.query).toHaveBeenCalledWith(
      `select count(distinct datname) as count from pg_database where datname = $1`,
      [testBed.options.database]
    );

    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining(testBed.options.database));

    expect(testBed.connection.close).toBeCalled();
  });
});
