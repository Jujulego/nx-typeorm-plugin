module.exports = {
  displayName: 'nx-typeorm-plugin',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/nx-typeorm-plugin',
  collectCoverageFrom: [
    "src/**/*.ts",
    "!**/*.spec.ts"
  ],
  coverageReporters: [
    'text',
    ['lcovonly', { projectRoot: 'packages/nx-typeorm-plugin' }]
  ]
};
