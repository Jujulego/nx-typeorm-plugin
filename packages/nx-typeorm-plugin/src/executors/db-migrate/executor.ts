import { logger } from '../../logger';
import { typeormExecutor, TypeormExecutorContext } from '../wrapper';

import { DBMigrateExecutorSchema } from './schema';

// Executor
export async function dbMigrate(options: DBMigrateExecutorSchema, context: TypeormExecutorContext) {
  // Read typeorm config
  const project = context.typeormProject;
  const config = await project.getOptions(options.database);

  // Connect to database
  logger.spin(`Migrating database ${config.database} ...`);
  const connection = await project.createConnection(config);

  try {
    // Migrate database
    const migrations = await connection.runMigrations({ transaction: 'each' });

    if (migrations.length > 0) {
      logger.succeed(`${migrations.length} migrations executed:`);

      for (const mig of migrations) {
        logger.succeed(`- ${mig.name}`);
      }
    } else {
      logger.stop();
      logger.info('Nothing to do');
    }

    return { success: true };
  } finally {
    await connection.close();
  }
}

export default typeormExecutor(dbMigrate);
