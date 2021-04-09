import ora from 'ora';
import chalk from 'chalk';

import { Logger } from './logger';

// Mocks
jest.mock('ora');

const mockedOra = {
  // Attributes
  isSpinning: false,
  text: '',

  // Methods
  start(text?: string) {
    this.isSpinning = true;
    this.text = text ?? this.text;

    return this;
  },

  stop() {
    this.isSpinning = false;

    return this;
  },

  stopAndPersist(opts: ora.PersistOptions) {
    this.isSpinning = false;
    this.text = opts?.text ?? this.text;

    return this;
  }
};

(ora as unknown as jest.Mock<ora.Ora, [ora.Options]>)
  .mockReturnValue(mockedOra as ora.Ora);

// Setup
const logger = new Logger();

beforeEach(() => {
  jest.restoreAllMocks();
  jest.resetAllMocks();

  mockedOra.text = '';
  mockedOra.isSpinning = false;
});

// Tests suites
describe('Logger.keepSpinner', () => {
  it('should still be spinning at the end', () => {
    // Set spinning
    mockedOra.text = 'spinning';
    mockedOra.isSpinning = true;

    // Test
    logger.keepSpinner(() => {
      mockedOra.text = 'stopped';
      mockedOra.isSpinning = false;
    });

    expect(mockedOra.text).toBe('spinning');
    expect(mockedOra.isSpinning).toBe(true);
  });

  it('should still not be spinning at the end', () => {
    // Set sleeping
    mockedOra.text = 'sleeping';
    mockedOra.isSpinning = false;

    // Test
    logger.keepSpinner(() => {
      mockedOra.text = 'stopped';
      mockedOra.isSpinning = false;
    });

    expect(mockedOra.text).toBe('stopped');
    expect(mockedOra.isSpinning).toBe(false);
  });
});

describe('Logger.spin', () => {
  beforeEach(() => {
    jest.spyOn(mockedOra, 'start');
  });

  // Tests
  it('should start a spinner', () => {
    // Set sleeping
    mockedOra.text = 'sleeping';
    mockedOra.isSpinning = false;

    // Test
    logger.spin('test');

    expect(mockedOra.isSpinning).toBe(true);
    expect(mockedOra.start).toHaveBeenCalledWith('test');
  });
});

describe('Logger.succeed', () => {
  beforeEach(() => {
    jest.spyOn(mockedOra, 'stopAndPersist');
  });

  // Tests
  it('should print and stop the spinner', () => {
    // Set spinning
    mockedOra.text = 'spinning';
    mockedOra.isSpinning = true;

    // Test
    logger.succeed('success !');

    expect(mockedOra.isSpinning).toBe(false);
    expect(mockedOra.stopAndPersist).toHaveBeenCalledWith({
      text: 'success !',
      symbol: expect.any(String)
    });
  });
});

describe('Logger.fail', () => {
  beforeEach(() => {
    jest.spyOn(mockedOra, 'stopAndPersist');
  });

  // Tests
  it('should print and stop the spinner', () => {
    // Set spinning
    mockedOra.text = 'spinning';
    mockedOra.isSpinning = true;

    // Test
    logger.fail('failed !');

    expect(mockedOra.isSpinning).toBe(false);
    expect(mockedOra.stopAndPersist).toHaveBeenCalledWith({
      text: chalk.red('failed !'),
      symbol: expect.any(String)
    });
  });
});

describe('Logger.stop', () => {
  it('should stop the spinner', () => {
    // Set spinning
    mockedOra.text = 'spinning';
    mockedOra.isSpinning = true;

    // Test
    logger.stop();

    expect(mockedOra.text).toBe('spinning');
    expect(mockedOra.isSpinning).toBe(false);
  });
});

describe('Logger.debug', () => {
  const text = 'debug !';

  beforeEach(() => {
    jest.spyOn(mockedOra, 'stopAndPersist');
  });

  // Tests
  it('should print', () => {
    // Set spinning
    mockedOra.text = 'test';
    mockedOra.isSpinning = false;

    // Test
    logger.setOptions({ verbosity: 'debug' });
    logger.debug(text);

    expect(mockedOra.isSpinning).toBe(false);
    expect(mockedOra.stopAndPersist).toHaveBeenCalledWith({
      text: chalk.gray(text),
      symbol: expect.any(String)
    });
  });

  it('should not print', () => {
    // Set spinning
    mockedOra.text = 'test';
    mockedOra.isSpinning = false;

    // Test
    logger.setOptions({ verbosity: 'info' });
    logger.debug(text);

    expect(mockedOra.isSpinning).toBe(false);
    expect(mockedOra.stopAndPersist).not.toHaveBeenCalled();
  });

  it('should print and keep the spinner', () => {
    // Set spinning
    mockedOra.text = 'spinning';
    mockedOra.isSpinning = true;

    // Test
    logger.setOptions({ verbosity: 'debug' });
    logger.debug(text);

    expect(mockedOra.text).toBe('spinning');
    expect(mockedOra.isSpinning).toBe(true);
    expect(mockedOra.stopAndPersist).toHaveBeenCalledWith({
      text: chalk.gray(text),
      symbol: expect.any(String)
    });
  });
});

describe('Logger.info', () => {
  const text = 'info !';

  beforeEach(() => {
    jest.spyOn(mockedOra, 'stopAndPersist');
  });

  // Tests
  it('should print', () => {
    // Set spinning
    mockedOra.text = 'test';
    mockedOra.isSpinning = false;

    // Test
    logger.setOptions({ verbosity: 'debug' });
    logger.info(text);

    expect(mockedOra.isSpinning).toBe(false);
    expect(mockedOra.stopAndPersist).toHaveBeenCalledWith({
      text: text,
      symbol: expect.any(String)
    });
  });

  it('should not print', () => {
    // Set spinning
    mockedOra.text = 'test';
    mockedOra.isSpinning = false;

    // Test
    logger.setOptions({ verbosity: 'warn' });
    logger.info(text);

    expect(mockedOra.isSpinning).toBe(false);
    expect(mockedOra.stopAndPersist).not.toHaveBeenCalled();
  });

  it('should print and keep the spinner', () => {
    // Set spinning
    mockedOra.text = 'spinning';
    mockedOra.isSpinning = true;

    // Test
    logger.setOptions({ verbosity: 'debug' });
    logger.info(text);

    expect(mockedOra.text).toBe('spinning');
    expect(mockedOra.isSpinning).toBe(true);
    expect(mockedOra.stopAndPersist).toHaveBeenCalledWith({
      text: text,
      symbol: expect.any(String)
    });
  });
});

describe('Logger.warn', () => {
  const text = 'warn !';

  beforeEach(() => {
    jest.spyOn(mockedOra, 'stopAndPersist');
  });

  // Tests
  it('should print', () => {
    // Set spinning
    mockedOra.text = 'test';
    mockedOra.isSpinning = false;

    // Test
    logger.setOptions({ verbosity: 'debug' });
    logger.warn(text);

    expect(mockedOra.isSpinning).toBe(false);
    expect(mockedOra.stopAndPersist).toHaveBeenCalledWith({
      text: chalk.yellow(text),
      symbol: expect.any(String)
    });
  });

  it('should not print', () => {
    // Set spinning
    mockedOra.text = 'test';
    mockedOra.isSpinning = false;

    // Test
    logger.setOptions({ verbosity: 'error' });
    logger.warn(text);

    expect(mockedOra.isSpinning).toBe(false);
    expect(mockedOra.stopAndPersist).not.toHaveBeenCalled();
  });

  it('should print and keep the spinner', () => {
    // Set spinning
    mockedOra.text = 'spinning';
    mockedOra.isSpinning = true;

    // Test
    logger.setOptions({ verbosity: 'debug' });
    logger.warn(text);

    expect(mockedOra.text).toBe('spinning');
    expect(mockedOra.isSpinning).toBe(true);
    expect(mockedOra.stopAndPersist).toHaveBeenCalledWith({
      text: chalk.yellow(text),
      symbol: expect.any(String)
    });
  });
});

describe('Logger.error', () => {
  const text = 'error !';

  beforeEach(() => {
    jest.spyOn(mockedOra, 'stopAndPersist');
  });

  // Tests
  it('should print', () => {
    // Set spinning
    mockedOra.text = 'test';
    mockedOra.isSpinning = false;

    // Test
    logger.setOptions({ verbosity: 'debug' });
    logger.error(text);

    expect(mockedOra.isSpinning).toBe(false);
    expect(mockedOra.stopAndPersist).toHaveBeenCalledWith({
      text: chalk.red(text),
      symbol: expect.any(String)
    });
  });

  it('should print error name and message', () => {
    // Set spinning
    mockedOra.text = 'test';
    mockedOra.isSpinning = false;

    // Test
    logger.setOptions({ verbosity: 'debug' });
    logger.error({ name: 'Error', message: 'test !' });

    expect(mockedOra.isSpinning).toBe(false);
    expect(mockedOra.stopAndPersist).toHaveBeenCalledWith({
      text: chalk.red('Error: test !'),
      symbol: expect.any(String)
    });
  });

  it('should print error stack', () => {
    // Set spinning
    mockedOra.text = 'test';
    mockedOra.isSpinning = false;

    // Test
    logger.setOptions({ verbosity: 'debug' });
    logger.error({ name: 'Error', message: 'test !', stack: 'Error: test !\n    at test (/test.ts:50:11)' });

    expect(mockedOra.isSpinning).toBe(false);
    expect(mockedOra.stopAndPersist).toHaveBeenCalledWith({
      text: chalk.red('Error: test !'),
      symbol: expect.any(String)
    });
    expect(mockedOra.stopAndPersist).toHaveBeenCalledWith({
      text: chalk.red('    at test (/test.ts:50:11)'),
      symbol: expect.any(String)
    });
  });

  it('should print and keep the spinner', () => {
    // Set spinning
    mockedOra.text = 'spinning';
    mockedOra.isSpinning = true;

    // Test
    logger.setOptions({ verbosity: 'debug' });
    logger.error(text);

    expect(mockedOra.text).toBe('spinning');
    expect(mockedOra.isSpinning).toBe(true);
    expect(mockedOra.stopAndPersist).toHaveBeenCalledWith({
      text: chalk.red(text),
      symbol: expect.any(String)
    });
  });
});
