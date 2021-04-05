import { LoggerOptions } from '../../logger';

// Schema
export interface MigrationGeneratorSchema extends Partial<LoggerOptions> {
  name: string;
  project: string;
  database: string;
}
