import { ExecutorContext } from '@nrwl/devkit';
import path from 'path';

import { logger } from '../../logger';
import { TypeormProject } from '../../typeorm-project';

import { DBCreateExecutorSchema } from './schema';

// Executor
export default async function(options: DBCreateExecutorSchema, context: ExecutorContext) {
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
    logger.spin(`Creating database ${config.database} ...`);
    const connection = await toProject.createConnection({ ...config, database: 'postgres' });

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
  } catch (error) {
    logger.stop();
    logger.error(error);

    return { success: false };
  }
}
