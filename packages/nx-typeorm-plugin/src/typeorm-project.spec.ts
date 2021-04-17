import { ConnectionOptions, ConnectionOptionsReader } from 'typeorm';

import { logger } from './logger';
import { TypeormLogger } from './typeorm-logger';
import { TypeormProject } from './typeorm-project';
import MockedClass = jest.MockedClass;
import MockedFunction = jest.MockedFunction;
import path from 'path';

jest.mock('typeorm');
jest.mock('ts-node');

// Setup
beforeEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  jest.spyOn(logger, 'debug').mockImplementation();
});

// Suites
describe('TypeormProject.getOptions', () => {
  // Constants
  const options: ConnectionOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    username: 'test',
    password: 'test',
    entities: ['**/*.entity.ts'],
    migrations: ['**/*.migration.ts'],
    subscribers: ['**/*.subscriber.ts'],
  };

  // Tests
  it('should return "default" connection options', async () => {
    // Create project
    const tproject = new TypeormProject('/project');

    expect(ConnectionOptionsReader).toHaveBeenCalledWith({
      root: '/project'
    });

    // Mock connection data
    const mockGet = (ConnectionOptionsReader as MockedClass<typeof ConnectionOptionsReader>)
      .mock.instances[0].get;

    (mockGet as MockedFunction<typeof mockGet>)
      .mockResolvedValue(options);

    // Test
    await expect(tproject.getOptions())
      .resolves.toEqual({
        ...options,
        logger: expect.any(TypeormLogger),
        entities: [path.normalize('/project/**/*.entity.ts')],
        migrations: [path.normalize('/project/**/*.migration.ts')],
        subscribers: [path.normalize('/project/**/*.subscriber.ts')],
      });
  });
});
