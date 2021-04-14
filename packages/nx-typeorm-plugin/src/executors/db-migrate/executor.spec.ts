import { ExecutorContext } from '@nrwl/devkit';
import { Connection, ConnectionOptions } from 'typeorm';

import { logger } from '../../logger';
import { TypeormProject } from '../../typeorm-project';

import executor from './executor';

// Types
type MCTP = jest.MockedClass<typeof TypeormProject>;

// Constants
const ctx = {
  projectName: 'test',
  root: '/project',
  workspace: {
    projects: {
      test: {
        root: 'test'
      }
    }
  }
} as unknown as ExecutorContext;

const database = 'test';
const options: ConnectionOptions = {
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

// Setup
jest.mock('../../logger');
jest.mock('../../typeorm-project');

beforeEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

// Suite
describe('db-migrate executor', () => {
  beforeEach(() => {
    // Mocks
    jest.spyOn(TypeormProject.prototype, 'getOptions')
      .mockResolvedValue(options);

    jest.spyOn(TypeormProject.prototype, 'createConnection')
      .mockResolvedValue(connection as unknown as Connection);
  });

  // Tests
  it('should fail (missing projectName in context)', async () => {
    await expect(executor({ database }, {  ...ctx, projectName: undefined }))
      .resolves.toEqual({
        success: false
      });

    // Checks
    expect(logger.error).toHaveBeenCalledWith('Missing project in context');
    expect(TypeormProject).not.toHaveBeenCalled();
  });

  it('should fail (unsupported database type)', async () => {
    jest.spyOn(TypeormProject.prototype, 'getOptions')
      .mockResolvedValue({
        type: 'mysql'
      });

    // Call
    await expect(executor({ database }, ctx))
      .resolves.toEqual({
        success: false
      });

    // Checks
    const project = (TypeormProject as MCTP).mock.instances[0];

    expect(project.getOptions).toHaveBeenCalledWith(database);
    expect(project.createConnection).not.toHaveBeenCalled();

    expect(logger.error).toHaveBeenCalledWith('Unsupported database type mysql');
  });

  it('should run, print migrations and succeed', async () => {
    connection.runMigrations.mockResolvedValue([{ name: 'TestMigration' }]);

    // Call
    await expect(executor({ database }, ctx))
      .resolves.toEqual({
        success: true
      });

    // Checks
    const project = (TypeormProject as MCTP).mock.instances[0];

    expect(project.getOptions).toHaveBeenCalledWith(database);
    expect(project.createConnection).toHaveBeenCalledWith(options);

    expect(connection.runMigrations).toHaveBeenCalledWith({ transaction: 'each' });

    expect(logger.succeed).toHaveBeenCalledWith(expect.stringContaining('TestMigration'));

    expect(connection.close).toBeCalled();
  });

  it('should do nothing and succeed', async () => {
    connection.runMigrations.mockResolvedValue([]);

    // Call
    await expect(executor({ database }, ctx))
      .resolves.toEqual({
        success: true
      });

    // Checks
    const project = (TypeormProject as MCTP).mock.instances[0];

    expect(project.getOptions).toHaveBeenCalledWith(database);
    expect(project.createConnection).toHaveBeenCalledWith(options);

    expect(connection.runMigrations).toHaveBeenCalledWith({ transaction: 'each' });

    expect(logger.info).toBeCalled();

    expect(connection.close).toBeCalled();
  });

  it('should fail if an error is thrown', async () => {
    const error = new Error('Test error');
    connection.runMigrations.mockRejectedValue(error);

    // Call
    await expect(executor({ database }, ctx))
      .resolves.toEqual({
        success: false
      });

    // Checks
    const project = (TypeormProject as MCTP).mock.instances[0];

    expect(project.getOptions).toHaveBeenCalledWith(database);
    expect(project.createConnection).toHaveBeenCalledWith(options);

    expect(connection.runMigrations).toHaveBeenCalledWith({ transaction: 'each' });

    expect(connection.close).toBeCalled();
    expect(logger.error).toHaveBeenCalledWith(error);
  });
});
