import chalk from 'chalk';
import { LoggerOptions } from 'typeorm';

import { logger } from './logger';
import { LogLevel, TypeormLogger } from './typeorm-logger';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  // Spies
  jest.spyOn(logger, 'debug').mockImplementation();
  jest.spyOn(logger, 'info').mockImplementation();
  jest.spyOn(logger, 'warn').mockImplementation();
  jest.spyOn(logger, 'error').mockImplementation();
});

// Suites
describe('TypeormLogger.logQuery', () => {
  // Constants
  const query: [string, any[]] = ['SELECT * FROM tests WHERE id=$1', ['1']];
  const colored = chalk`{blueBright SELECT} * {blueBright FROM} tests {blueBright WHERE} id=\${green 1} {grey -- PARAMETERS: ["1"]}`;

  // Tests
  it('should not print (no options)', () => {
    const tlogger = new TypeormLogger();
    tlogger.logQuery(...query);

    expect(logger.debug).not.toHaveBeenCalled();
  });

  for (const options of [true, 'all', ['query']] as LoggerOptions[]) {
    it(`should print (options = ${options})`, () => {
      const tlogger = new TypeormLogger(options);
      tlogger.logQuery(...query);

      expect(logger.debug).toHaveBeenCalledWith(colored);
    });
  }
});

describe('TypeormLogger.logQueryError', () => {
  // Constants
  const error = 'no column id !';
  const query: [string, any[]] = ['SELECT * FROM tests WHERE id=$1', ['1']];
  const colored = chalk`{blueBright SELECT} * {blueBright FROM} tests {blueBright WHERE} id=\${green 1} {grey -- PARAMETERS: ["1"]}`;

  // Tests
  it('should not print (no options)', () => {
    const tlogger = new TypeormLogger();
    tlogger.logQueryError(error, ...query);

    expect(logger.error).not.toHaveBeenCalled();
  });

  for (const options of [true, 'all', ['error']] as LoggerOptions[]) {
    it(`should print (options = ${options})`, () => {
      const tlogger = new TypeormLogger(options);
      tlogger.logQueryError(error, ...query);

      expect(logger.error).toHaveBeenCalledWith(colored);
      expect(logger.error).toHaveBeenCalledWith(error);
    });
  }
});

describe('TypeormLogger.logQuerySlow', () => {
  // Constants
  const time = 4500;
  const query: [string, any[]] = ['SELECT * FROM tests WHERE id=$1', ['1']];
  const colored = chalk`{blueBright SELECT} * {blueBright FROM} tests {blueBright WHERE} id=\${green 1} {grey -- PARAMETERS: ["1"]}`;

  // Tests
  it('should print (no options)', () => {
    const tlogger = new TypeormLogger();
    tlogger.logQuerySlow(time, ...query);

    expect(logger.warn).toHaveBeenCalledWith(colored);
    expect(logger.warn).toHaveBeenCalledWith(`took ${time}ms`);
  });
});

describe('TypeormLogger.logSchemaBuild', () => {
  // Constants
  const message = 'schema test built';

  // Tests
  it('should not print (no options)', () => {
    const tlogger = new TypeormLogger();
    tlogger.logSchemaBuild(message);

    expect(logger.debug).not.toHaveBeenCalled();
  });

  it(`should print (options = schema)`, () => {
    const tlogger = new TypeormLogger(['schema']);
    tlogger.logSchemaBuild(message);

    expect(logger.debug).toHaveBeenCalledWith(message);
  });
});

describe('TypeormLogger.logMigration', () => {
  // Constants
  const message = 'migration test done';

  // Tests
  it('should not print (no options)', () => {
    const tlogger = new TypeormLogger();
    tlogger.logMigration(message);

    expect(logger.debug).not.toHaveBeenCalled();
  });

  it(`should print (options = migration)`, () => {
    const tlogger = new TypeormLogger(['migration']);
    tlogger.logMigration(message);

    expect(logger.debug).toHaveBeenCalledWith(message);
  });
});

describe('TypeormLogger.log', () => {
  // Constants
  const message = 'test';

  // Tests
  for (const [level, lfun] of [['log', 'debug'], ['info', 'info'], ['warn', 'warn']] as [LogLevel, keyof typeof logger][]) {
    it('should not print (no options)', () => {
      const tlogger = new TypeormLogger();
      tlogger.log(level, message);

      expect(logger[lfun]).not.toHaveBeenCalled();
    });

    it(`should print (options = ${level})`, () => {
      const tlogger = new TypeormLogger([level]);
      tlogger.log(level, message);

      expect(logger[lfun]).toHaveBeenCalledWith(message);
    });
  }
});
