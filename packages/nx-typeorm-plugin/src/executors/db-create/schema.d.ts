import { LoggerOptions } from '../../logger';

// Schema
export interface DBCreateExecutorSchema extends Partial<LoggerOptions> {
  database: string;
}
