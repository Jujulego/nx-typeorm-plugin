import { formatFiles, generateFiles, names, readProjectConfiguration, Tree } from '@nrwl/devkit';
import * as path from 'path';

import { logger } from '../../logger';
import { TypeormProject } from '../../typeorm-project';

import { MigrationGeneratorSchema } from './schema';

// Steps
async function generateMigration(host: Tree, options: MigrationGeneratorSchema) {
  logger.setOptions(options);

  // Load typeorm config
  const projectRoot = readProjectConfiguration(host, options.project).root;
  const project = new TypeormProject(path.join(host.root, projectRoot));

  const config = await project.getOptions(options.database);

  if (!config.cli?.migrationsDir) {
    throw new Error(`Missing cli.migrationsDir in ormconfig for ${options.database}`);
  }

  // Generate migration
  const connection = await project.createConnection(config);
  const sql = await connection.driver.createSchemaBuilder().log();

  if (sql.upQueries.length === 0) {
    logger.info('No missing migration');
    return;
  }

  // Count existing migrations
  const migrationsDir = path.join(projectRoot, config.cli.migrationsDir);
  const migrations = host.children(migrationsDir)
    .filter(file => file.endsWith('.migration.ts'));

  let number = (migrations.length + 1).toString();
  while (number.length < 4) number = '0' + number;

  // Create files
  const templateOptions = {
    ...names(options.name),
    number,
    timestamp: Date.now(),
    sql,
    tmpl: ''
  };
  generateFiles(host, path.join(__dirname, 'files'), migrationsDir, templateOptions);
}

// Factory
export default async function (host: Tree, options: MigrationGeneratorSchema) {
  await generateMigration(host, options);
  await formatFiles(host);
}
