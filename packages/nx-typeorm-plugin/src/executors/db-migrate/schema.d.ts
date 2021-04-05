import { LoggerOptions } from '../../logger';

// Schema
export interface DBMigrateExecutorSchema extends Partial<LoggerOptions> {
  database: string;
}
