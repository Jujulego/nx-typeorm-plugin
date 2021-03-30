import { AdvancedConsoleLogger, LoggerOptions, QueryRunner } from 'typeorm';
import { PlatformTools } from 'typeorm/platform/PlatformTools';
import * as ora from 'ora';

// Logger
export class OraLogger extends AdvancedConsoleLogger {
  // Attributes
  private previousText = "";
  private wasSpinning = false;

  // Constructor
  constructor(private readonly spinner: ora.Ora, private _options?: LoggerOptions) {
    super(_options);
  }

  // Methods
  private saveState() {
    if (this.spinner.isSpinning) {
      this.wasSpinning = true;
      this.previousText = this.spinner.text;
    } else {
      this.wasSpinning = false;
    }
  }

  private resetState() {
    if (this.wasSpinning) {
      this.spinner.start(this.previousText);
    }
  }

  protected hasLevel(level: Exclude<LoggerOptions, 'all' | boolean>[0]): boolean {
    return this._options === 'all' || (Array.isArray(this._options) && this._options.indexOf(level) !== -1);
  }

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): void {
    if (this._options === true || this.hasLevel('query')) {
      this.saveState();

      // Log query
      const sql = query + (parameters?.length ? ` -- PARAMETERS: ${this.stringifyParams(parameters)}` : '');
      this.spinner.stopAndPersist({
        text: PlatformTools.highlightSql(sql),
        symbol: ' '
      });

      this.resetState();
    }
  }

  logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner): void {
    if (this._options === true || this.hasLevel('error')) {
      this.saveState();

      // Log query
      const sql = query + (parameters?.length ? " -- PARAMETERS: " + this.stringifyParams(parameters) : "");
      this.spinner.fail(PlatformTools.highlightSql(sql));
      this.spinner.fail(error);

      this.resetState();
    }
  }

  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): void {
    this.saveState();

    // Log query
    const sql = query + (parameters?.length ? " -- PARAMETERS: " + this.stringifyParams(parameters) : "");
    this.spinner.warn(PlatformTools.highlightSql(sql));
    this.spinner.warn(time.toString());

    this.resetState();
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner): void {
    if (this.hasLevel('schema')) {
      this.saveState();

      // Log query
      this.spinner.stopAndPersist({ text: message, symbol: ' ' });

      this.resetState();
    }
  }

  logMigration(message: string, queryRunner?: QueryRunner): void {
    if (this.hasLevel('migration')) {
      this.saveState();

      // Log query
      this.spinner.stopAndPersist({ text: message, symbol: ' ' });

      this.resetState();
    }
  }

  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner): void {
    if (this.hasLevel(level)) {
      this.saveState();

      // Log query
      switch (level) {
        case 'log':
          this.spinner.stopAndPersist({ text: message, symbol: ' ' });
          break;

        case 'info':
          this.spinner.info(message);
          break;

        case 'warn':
          this.spinner.warn(message);
          break;
      }

      this.resetState();
    }
  }
}
