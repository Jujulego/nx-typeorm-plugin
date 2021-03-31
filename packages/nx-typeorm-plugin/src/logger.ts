import chalk from 'chalk';
import logSymbols from 'log-symbols';
import ora from 'ora';

// Types
export type LogLevel = 'debug' | 'info' | 'success' | 'warn' | 'error' | 'fail';

// Constants
const SYMBOLS: Record<LogLevel, string> = {
  debug:   ' ',
  info:    logSymbols.info,
  success: logSymbols.success,
  warn:    logSymbols.warning,
  error:   logSymbols.error,
  fail:    logSymbols.error
}

// Logger
export class Logger {
  // Attributes
  private spinner = ora();

  // Methods
  keepSpinner<T>(fun: () => T): T {
    // Save state
    let spinning = false;
    let text = '';

    if (this.spinner.isSpinning) {
      spinning = true;
      text = this.spinner.text;
    }

    try {
      return fun();
    } finally {
      // Restore state
      if (!this.spinner.isSpinning && spinning) {
        this.spinner.start(text);
      }
    }
  }

  // Spinner
  spin(message: string): void {
    this.spinner.start(message);
  }

  succeed(message?: string): void {
    this.spinner.stopAndPersist({ text: message, symbol: SYMBOLS['success'] });
  }

  fail(message?: string): void {
    this.spinner.stopAndPersist({ text: message, symbol: SYMBOLS['fail'] });
  }

  stop(): void {
    this.spinner.stop();
  }

  // Logs
  debug(message: string): void {
    this.log('debug', message);
  }

  info(message: string): void {
    this.log('info', message);
  }

  warn(message: string): void {
    this.log('warn', message);
  }

  error(message: string): void {
    this.log('error', message);
  }

  log(level: LogLevel, message: string): void {
    this.keepSpinner(() => {
      // Format message
      switch (level) {
        case 'debug':
          message = chalk.gray(message);
          break;

        case 'warn':
          message = chalk.yellow(message);
          break;

        case 'error':
        case 'fail':
          message = chalk.red(message);
      }

      this.spinner.stopAndPersist({ text: message, symbol: SYMBOLS[level] ?? ' ' });
    });
  }
}

export const logger = new Logger();
