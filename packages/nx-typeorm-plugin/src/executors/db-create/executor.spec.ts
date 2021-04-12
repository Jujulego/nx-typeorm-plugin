import { ExecutorContext } from '@nrwl/devkit';

import { logger } from '../../logger';
import { TypeormProject } from '../../typeorm-project';
import executor from './executor';

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

// Setup
jest.mock('../../logger');
jest.mock('../../typeorm-project');

beforeEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

// Suite
describe('db-create executor', () => {
  it('should fail (missing projectName in context)', async () => {
    await expect(executor({ database: 'test' }, {  ...ctx, projectName: undefined }))
      .resolves.toEqual({
        success: false
      });

    expect(logger.error).toHaveBeenCalledWith('Missing project in context');
  });

  it('should fail (unsupported database type)', async () => {
    jest.spyOn(TypeormProject.prototype, 'getOptions')
      .mockResolvedValue({
          type: 'mysql'
        });

    await expect(executor({ database: 'test' }, ctx))
      .resolves.toEqual({
        success: false
      });

    expect(logger.error).toHaveBeenCalledWith('Unsupported database type mysql');
  });
});
