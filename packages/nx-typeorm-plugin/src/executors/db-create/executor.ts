import { logger } from '../../logger';

import { typeormExecutor, TypeormExecutorContext } from '../wrapper';
import { DBCreateExecutorSchema } from './schema';
import { Driver } from '../../drivers';

// Executor
export async function dbCreate(options: DBCreateExecutorSchema, context: TypeormExecutorContext) {
  // Read typeorm config
  const project = context.typeormProject;
  const config = await project.getOptions(options.database);

  if (!Driver.isSupported(config.type)) {
    logger.error(`Unsupported database type ${config.type}`);
    return { success: false };
  }

  // Connect to database
  logger.spin(`Creating database ${config.database} ...`);
  const connection = await project.createConnection(Driver.adaptOptions(config));

  try {
    // Create database if missing
    const driver = Driver.buildDriver(connection);

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
    await connection.close();
  }
}

export default typeormExecutor(dbCreate);
