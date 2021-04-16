import { logger } from '../../logger';
import { ExecutorTestBed } from '../../../mocks/executor';

import { dbMigrate } from './executor';

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
describe('db-migrate executor', () => {
  // Tests
  it('should fail (unsupported database type)', async () => {
    testBed.context.typeormProject.getOptions
      .mockResolvedValue({
        ...testBed.options,
        type: 'mysql'
      });

    // Call
    await expect(testBed.callExecutor(dbMigrate, { database: testBed.database }))
      .resolves.toEqual({
        success: false
      });

    // Checks
    expect(testBed.context.typeormProject.getOptions).toHaveBeenCalledWith(testBed.database);
    expect(testBed.context.typeormProject.createConnection).not.toHaveBeenCalled();

    expect(logger.error).toHaveBeenCalledWith('Unsupported database type mysql');
  });

  it('should run, print migrations and succeed', async () => {
    testBed.connection.runMigrations.mockResolvedValue([{ name: 'TestMigration' }]);

    // Call
    await expect(testBed.callExecutor(dbMigrate, { database: testBed.database }))
      .resolves.toEqual({
        success: true
      });

    // Checks
    expect(testBed.context.typeormProject.getOptions).toHaveBeenCalledWith(testBed.database);
    expect(testBed.context.typeormProject.createConnection).not.toHaveBeenCalledWith(testBed.options);

    expect(testBed.connection.runMigrations).toHaveBeenCalledWith({ transaction: 'each' });

    expect(logger.succeed).toHaveBeenCalledWith(expect.stringContaining('TestMigration'));

    expect(testBed.connection.close).toBeCalled();
  });

  it('should do nothing and succeed', async () => {
    testBed.connection.runMigrations.mockResolvedValue([]);

    // Call
    await expect(testBed.callExecutor(dbMigrate, { database: testBed.database }))
      .resolves.toEqual({
        success: true
      });

    // Checks
    expect(testBed.context.typeormProject.getOptions).toHaveBeenCalledWith(testBed.database);
    expect(testBed.context.typeormProject.createConnection).not.toHaveBeenCalledWith(testBed.options);

    expect(testBed.connection.runMigrations).toHaveBeenCalledWith({ transaction: 'each' });
    expect(testBed.connection.close).toBeCalled();

    expect(logger.info).toBeCalled();
  });
});
