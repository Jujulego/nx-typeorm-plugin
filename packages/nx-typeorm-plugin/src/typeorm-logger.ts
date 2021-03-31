import { AdvancedConsoleLogger, LoggerOptions } from 'typeorm';
import { PlatformTools } from 'typeorm/platform/PlatformTools';

import { logger } from './logger';

// Logger
export class TypeormLogger extends AdvancedConsoleLogger {
  // Constructor
  constructor(private _options?: LoggerOptions) {
    super(_options);
  }

  // Methods
  protected hasLevel(level: Exclude<LoggerOptions, 'all' | boolean>[0]): boolean {
    return this._options === 'all' || (Array.isArray(this._options) && this._options.indexOf(level) !== -1);
  }

  logQuery(query: string, parameters?: any[]): void {
    if (this._options === true || this.hasLevel('query')) {
      // Log query
      const sql = query + (parameters?.length ? ` -- PARAMETERS: ${this.stringifyParams(parameters)}` : '');
      logger.debug(PlatformTools.highlightSql(sql));
    }
  }

  logQueryError(error: string, query: string, parameters?: any[]): void {
    if (this._options === true || this.hasLevel('error')) {
      // Log query
      const sql = query + (parameters?.length ? " -- PARAMETERS: " + this.stringifyParams(parameters) : "");

      logger.keepSpinner(() => {
        logger.fail(PlatformTools.highlightSql(sql));
        logger.fail(error);
      });
    }
  }

  logQuerySlow(time: number, query: string, parameters?: any[]): void {
    // Log query
    const sql = query + (parameters?.length ? " -- PARAMETERS: " + this.stringifyParams(parameters) : "");
    logger.warn(PlatformTools.highlightSql(sql));
    logger.warn(time.toString());
  }

  logSchemaBuild(message: string): void {
    if (this.hasLevel('schema')) {
      logger.debug(message);
    }
  }

  logMigration(message: string): void {
    if (this.hasLevel('migration')) {
      logger.debug(message);
    }
  }

  log(level: 'log' | 'info' | 'warn', message: any): void {
    if (this.hasLevel(level)) {
      // Log query
      switch (level) {
        case 'log':
          logger.debug(message);
          break;

        case 'info':
          logger.info(message);
          break;

        case 'warn':
          logger.warn(message);
          break;
      }
    }
  }
}
