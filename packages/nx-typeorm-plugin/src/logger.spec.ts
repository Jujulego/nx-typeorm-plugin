import ora from 'ora';

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
    // Set spinning
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
