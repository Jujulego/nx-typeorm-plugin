import { BuildExecutorSchema } from './schema';

import { logger, LogLevel } from '../../logger';

// Executor
async function runExecutor(options: BuildExecutorSchema) {
  logger.spin('Loading');

  for (let i = 3; i >= 0; --i) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    logger.log(['debug', 'info', 'warn', 'error'][i] as LogLevel, `Wait for ${i}s`);
  }

  logger.succeed('Finished !');

  return {
    success: true,
  };
}

export default runExecutor;
