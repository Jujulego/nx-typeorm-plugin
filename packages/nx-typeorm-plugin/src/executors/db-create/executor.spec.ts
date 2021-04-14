import { ExecutorContext } from '@nrwl/devkit';

import { logger } from '../../logger';
import { TypeormProject } from '../../typeorm-project';
import executor from './executor';
import { Connection, ConnectionOptions } from 'typeorm';

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
  query: jest.fn(),
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
describe('db-create executor', () => {
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

  it('should create database and succeed', async () => {
    connection.query.mockResolvedValue([{ count: '0' }]);

    // Call
    await expect(executor({ database }, ctx))
      .resolves.toEqual({
        success: true
      });

    // Checks
    const project = (TypeormProject as MCTP).mock.instances[0];

    expect(project.getOptions).toHaveBeenCalledWith(database);
    expect(project.createConnection).toHaveBeenCalledWith({ ...options, database: 'postgres' });

    expect(connection.query).toBeCalledTimes(2);
    expect(connection.query).toHaveBeenCalledWith(
      `select count(distinct datname) as count from pg_database where datname = $1`,
      [options.database]
    );

    expect(connection.query).toHaveBeenCalledWith(
      `create database "${options.database}"`
    );

    expect(connection.close).toBeCalled();
  });

  it('should do nothing and succeed', async () => {
    connection.query.mockResolvedValue([{ count: '1' }]);

    // Call
    await expect(executor({ database }, ctx))
      .resolves.toEqual({
        success: true
      });

    // Checks
    const project = (TypeormProject as MCTP).mock.instances[0];

    expect(project.getOptions).toHaveBeenCalledWith(database);
    expect(project.createConnection).toHaveBeenCalledWith({ ...options, database: 'postgres' });

    expect(connection.query).toBeCalledTimes(1);
    expect(connection.query).toHaveBeenCalledWith(
      `select count(distinct datname) as count from pg_database where datname = $1`,
      [options.database]
    );

    expect(connection.close).toBeCalled();
  });

  it('should fail if an error is thrown', async () => {
    const error = new Error('Test error');
    connection.query.mockRejectedValue(error);

    // Call
    await expect(executor({ database }, ctx))
      .resolves.toEqual({
        success: false
      });

    // Checks
    const project = (TypeormProject as MCTP).mock.instances[0];

    expect(project.getOptions).toHaveBeenCalledWith(database);
    expect(project.createConnection).toHaveBeenCalledWith({ ...options, database: 'postgres' });

    expect(connection.query).toBeCalledTimes(1);
    expect(connection.query).toHaveBeenCalledWith(
      `select count(distinct datname) as count from pg_database where datname = $1`,
      [options.database]
    );

    expect(connection.close).toBeCalled();
    expect(logger.error).toHaveBeenCalledWith(error);
  });
});
