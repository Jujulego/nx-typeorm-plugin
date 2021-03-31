import { ExecutorContext } from '@nrwl/devkit';
import path from 'path';

import { logger } from '../../logger';
import { TypeormProject } from '../../typeorm-project';
import { BuildExecutorSchema } from './schema';

// Executor
async function runExecutor(options: BuildExecutorSchema, context: ExecutorContext) {
  // Load project
  if (!context.projectName) {
    logger.error('Missing project in context');
    return { success: false };
  }

  const nxProject = context.workspace.projects[context.projectName]
  const toProject = new TypeormProject(path.resolve(context.root, nxProject.root));

  // Read options
  console.log(await toProject.getOptions());

  return {
    success: true,
  };
}

export default runExecutor;
