import { logger } from '../../logger';

import { typeormExecutor, TypeormExecutorContext } from '../wrapper';
import { DBCreateExecutorSchema } from './schema';

// Executor
export async function dbCreate(options: DBCreateExecutorSchema, context: TypeormExecutorContext) {
  // Read typeorm config
  const project = context.typeormProject;
  const config = await project.getOptions(options.database);

  if (config.type !== 'postgres') {
    logger.error(`Unsupported database type ${config.type}`);
    return { success: false };
  }

  // Connect to database
  logger.spin(`Creating database ${config.database} ...`);
  const connection = await project.createConnection({ ...config, database: 'postgres' });

  try {
    // Create database if missing
    const [{ count }] = await connection.query(
      `select count(distinct datname) as count from pg_database where datname = $1`,
      [config.database]
    );

    if (count === '0') {
      logger.debug(`Database ${config.database} does not exists`);
      await connection.query(`create database "${config.database}"`);

      logger.succeed(`Database ${config.database} created`);
    } else {
      logger.stop();
      logger.info(`Database ${config.database} already exists`);
    }

    return { success: true };
  } finally {
    await connection.close();
  }
}

export default typeormExecutor(dbCreate);
