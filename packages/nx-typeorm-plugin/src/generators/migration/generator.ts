import { formatFiles, generateFiles, names, readProjectConfiguration, Tree } from '@nrwl/devkit';
import { Query } from 'typeorm/driver/Query';
import { MysqlDriver } from 'typeorm/driver/mysql/MysqlDriver';
import { AuroraDataApiDriver } from 'typeorm/driver/aurora-data-api/AuroraDataApiDriver';
import * as path from 'path';

import { logger } from '../../logger';
import { TypeormProject } from '../../typeorm-project';

import { MigrationGeneratorSchema } from './schema';

// Utils
function escapeQuery(query: Query, quote: string): string {
  return `${quote}${query.query.replace(new RegExp(quote, 'g'), `\\${quote}`)}${quote}`;
}

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

  // Connect to database
  const connection = await project.createConnection(config);

  try {
    // Generate migration
    const sql = await connection.driver.createSchemaBuilder().log();

    if (sql.upQueries.length === 0) {
      logger.info('No missing migration');
      return;
    }

    // Format queries
    const quote = (connection.driver instanceof MysqlDriver || connection.driver instanceof AuroraDataApiDriver) ? '"' : '`';
    const ups = sql.upQueries.map(query => escapeQuery(query, quote));
    const downs = sql.downQueries.map(query => escapeQuery(query, quote));

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
      ups, downs,
      tmpl: ''
    };
    generateFiles(host, path.join(__dirname, 'files'), migrationsDir, templateOptions);
  } finally {
    await connection.close();
  }
}

// Factory
export default async function (host: Tree, options: MigrationGeneratorSchema) {
  await generateMigration(host, options);
  await formatFiles(host);
}
