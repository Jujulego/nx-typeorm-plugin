import { ExecutorContext } from '@nrwl/devkit';
import path from 'path';

import { logger } from '../../logger';
import { TypeormProject } from '../../typeorm-project';

import { DBMigrateExecutorSchema } from './schema';

// Executor
export default async function(options: DBMigrateExecutorSchema, context: ExecutorContext) {
  try {
    // Load project
    if (!context.projectName) {
      logger.error('Missing project in context');
      return { success: false };
    }

    const nxProject = context.workspace.projects[context.projectName]
    const toProject = new TypeormProject(path.resolve(context.root, nxProject.root));

    // Read typeorm config
    const config = await toProject.getOptions(options.database);

    if (config.type !== 'postgres') {
      logger.error(`Unsupported database type ${config.type}`);
      return { success: false };
    }

    // Connect to database
    logger.spin(`Migrating database ${config.database} ...`);
    const connection = await toProject.createConnection(config);

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
  } catch (error) {
    logger.stop();
    logger.error(error);

    return { success: false };
  }
}
