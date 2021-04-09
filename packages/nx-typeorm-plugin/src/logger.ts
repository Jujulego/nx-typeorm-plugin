import chalk from 'chalk';
import logSymbols from 'log-symbols';
import ora from 'ora';

// Types
export type LogLevel = 'debug' | 'info' | 'success' | 'warn' | 'error' | 'fail';

export interface LoggerOptions {
  verbosity: Exclude<LogLevel, 'success' | 'fail'>;
}

// Constants
const LEVELS = ['debug', 'info', 'warn', 'error'];
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
  private options: LoggerOptions = { verbosity: 'info' };

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

  setOptions(options: Partial<LoggerOptions>) {
    this.options.verbosity = options.verbosity ?? this.options.verbosity;
  }

  private shouldLog(level: LogLevel): boolean {
    // Simple cases
    if (['success', 'fail'].includes(level)) return true;

    // Test
    const allowed = LEVELS.indexOf(this.options.verbosity);
    const index = LEVELS.indexOf(level);

    return index >= allowed;
  }

  private formatLog(level: LogLevel, log: string): string[] {
    return log.split('\n')
      .map(line => {
        switch (level) {
          case 'debug':
            return chalk.gray(line);

          case 'warn':
            return chalk.yellow(line);

          case 'error':
          case 'fail':
            return chalk.red(line);

          default:
            return line;
        }
      });
  }

  // Spinner
  spin(message: string): void {
    this.spinner.start(message);
  }

  succeed(log: string): void {
    this.log('success', log);
  }

  fail(log: string): void {
    this.log('fail', log);
  }

  stop(): void {
    this.spinner.stop();
  }

  // Logs
  protected log(level: LogLevel, message: string): void {
    if (!this.shouldLog(level)) return;

    for (const line of this.formatLog(level, message)) {
      this.spinner.stopAndPersist({ text: line, symbol: SYMBOLS[level] ?? ' ' });
    }
  }

  debug(message: string): void {
    this.keepSpinner(() => {
      this.log('debug', message);
    });
  }

  info(message: string): void {
    this.keepSpinner(() => {
      this.log('info', message);
    });
  }

  warn(message: string): void {
    this.keepSpinner(() => {
      this.log('warn', message);
    });
  }

  error(message: string | Error): void {
    this.keepSpinner(() => {
      if (typeof message === 'string') {
        this.log('error', message);
      } else {
        if (message.stack) {
          this.log('error', message.stack);
        } else {
          this.log('error', `${message.name}: ${message.message}`);
        }
      }
    });
  }
}

export const logger = new Logger();
