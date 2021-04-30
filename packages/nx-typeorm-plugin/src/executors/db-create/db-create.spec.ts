import { logger } from '../../logger';
import { ExecutorTestBed } from '../../../mocks/executor';

import { dbCreate } from './executor';
import { DatabaseServiceDriver } from '../../drivers';

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
    testBed.driver.databaseExists.mockResolvedValue(false);

    // Call
    await expect(testBed.callExecutor(dbCreate, { database: testBed.database }))
      .resolves.toEqual({
        success: true
      });

    // Checks
    expect(DatabaseServiceDriver.connect).toHaveBeenCalledWith(testBed.context.typeormProject, testBed.options);
    expect(testBed.driver.databaseExists).toHaveBeenCalledWith(testBed.options.database);
    expect(testBed.driver.createDatabase).toHaveBeenCalledWith(testBed.options.database);

    expect(logger.succeed).toHaveBeenCalledWith(expect.stringContaining(testBed.options.database));

    expect(testBed.driver.close).toBeCalled();
  });

  it('should do nothing and succeed', async () => {
    testBed.driver.databaseExists.mockResolvedValue(true);

    // Call
    await expect(testBed.callExecutor(dbCreate, { database: testBed.database }))
      .resolves.toEqual({
        success: true
      });

    // Checks
    expect(DatabaseServiceDriver.connect).toHaveBeenCalledWith(testBed.context.typeormProject, testBed.options);
    expect(testBed.driver.databaseExists).toHaveBeenCalledWith(testBed.options.database);
    expect(testBed.driver.createDatabase).not.toHaveBeenCalled();

    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining(testBed.options.database));

    expect(testBed.driver.close).toBeCalled();
  });
});
