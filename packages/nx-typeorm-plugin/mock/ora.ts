import ora from 'ora';

// Mock
jest.mock('ora');

export const mockedOra = {
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
