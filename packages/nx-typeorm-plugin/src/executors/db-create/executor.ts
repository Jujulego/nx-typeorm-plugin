import { DatabaseServiceDriver } from '../../drivers';
import { logger } from '../../logger';

import { typeormExecutor, TypeormExecutorContext } from '../wrapper';
import { DBCreateExecutorSchema } from './schema';

// Executor
export async function dbCreate(options: DBCreateExecutorSchema, context: TypeormExecutorContext) {
  // Read typeorm config
  const project = context.typeormProject;
  const config = await project.getOptions(options.database);

  // Connect to database
  logger.spin(`Creating database ${config.database} ...`);
  const driver = await DatabaseServiceDriver.connect(project, config);

  try {
    // Create database if missing
    if (await driver.databaseExists(config.database)) {
      logger.stop();
      logger.info(`Database ${config.database} already exists`);
    } else {
      logger.debug(`Database ${config.database} does not exists`);
      await driver.createDatabase(config.database);

      logger.succeed(`Database ${config.database} created`);
    }

    return { success: true };
  } finally {
    await driver.close();
  }
}

export default typeormExecutor(dbCreate);
