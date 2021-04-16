import { ExecutorContext } from '@nrwl/devkit';
import path from 'path';

import { logger } from '../logger';
import { TypeormProject } from '../typeorm-project';

import { typeormExecutor, TypeormExecutorContext } from './wrapper';

// Constants
const executorContext: ExecutorContext = {
  root: '/project',
  projectName: 'test',
  targetName: 'test',
  configurationName: 'test',
  target: {
    executor: '@test/test:test',
    options: {}
  },
  workspace: {
    version: 1,
    projects: {
      test: {
        root: 'apps/test',
        targets: {
          test: {
            executor: '@test/test:test',
            options: {}
          }
        }
      }
    }
  },
  cwd: '/project',
  isVerbose: false
};

// Setup
jest.mock('../logger');
jest.mock('../typeorm-project');

beforeEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

// Test suites
describe('TypeormExecutorContext.project', () => {
  let ctx: TypeormExecutorContext;

  beforeEach(() => {
    ctx = new TypeormExecutorContext(executorContext);
  });

  // Tests
  it('should return project data', () => {
    expect(ctx.projectName).toEqual('test');
    expect(ctx.project).toEqual(executorContext.workspace.projects.test);
  });

  it('should throw an error (missing projectName)', () => {
    delete ctx.projectName;

    expect(() => ctx.project).toThrowError('Missing projectName in context')
  });
});

describe('TypeormExecutorContext.typeormProject', () => {
  let ctx: TypeormExecutorContext;

  beforeEach(() => {
    ctx = new TypeormExecutorContext(executorContext);
  });

  // Tests
  it('should return project data', () => {
    expect(ctx.projectName).toEqual('test');
    expect(ctx.typeormProject).toBeInstanceOf(TypeormProject);

    expect(TypeormProject).toHaveBeenCalledWith(path.resolve('/project/apps/test'));
  });

  it('should throw an error (missing projectName)', () => {
    delete ctx.projectName;

    expect(() => ctx.typeormProject).toThrowError('Missing projectName in context')
  });
});

describe('typeormExecutor', () => {
  // Tests
  it('should call async executor', async () => {
    const executor = jest.fn(async () => ({ success: true }));

    // Call
    await expect(typeormExecutor(executor)({}, executorContext))
      .resolves.toEqual({ success: true });

    // Checks
    expect(executor).toHaveBeenCalledWith({}, expect.any(TypeormExecutorContext));

    expect(logger.setOptions).toHaveBeenCalledWith({ verbosity: undefined });
    expect(logger.stop).toHaveBeenCalled();
  });

  it('should call failing async executor', async () => {
    const error = new Error('test');
    const executor = jest.fn(async () => { throw error; });

    // Call
    await expect(typeormExecutor(executor)({}, executorContext))
      .resolves.toEqual({ success: false });

    // Checks
    expect(executor).toHaveBeenCalledWith({}, expect.any(TypeormExecutorContext));

    expect(logger.setOptions).toHaveBeenCalledWith({ verbosity: undefined });
    expect(logger.stop).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(error);
  });

  it('should call async* executor', async () => {
    const executor = jest.fn(async function* () {
      yield { success: true };
    });

    // Call
    for await (const res of typeormExecutor(executor)({}, executorContext)) {
      expect(res).toEqual({ success: true });
    }

    // Checks
    expect(executor).toHaveBeenCalledWith({}, expect.any(TypeormExecutorContext));

    expect(logger.setOptions).toHaveBeenCalledWith({ verbosity: undefined });
    expect(logger.stop).toHaveBeenCalled();
  });

  it('should call failing async* executor', async () => {
    const error = new Error('test');
    const executor = jest.fn(async function* () {
      throw error;
      yield { success: true };
    });

    // Call
    for await (const res of typeormExecutor(executor)({}, executorContext)) {
      expect(res).toEqual({ success: false });
    }

    // Checks
    expect(executor).toHaveBeenCalledWith({}, expect.any(TypeormExecutorContext));

    expect(logger.setOptions).toHaveBeenCalledWith({ verbosity: undefined });
    expect(logger.stop).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(error);
  });
});
