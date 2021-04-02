import { Connection, ConnectionOptions, ConnectionOptionsReader, getConnectionManager } from 'typeorm';
import * as tsnode from 'ts-node';
import path from 'path';

import { logger } from './logger';
import { TypeormLogger } from './typeorm-logger';

// Reader
export class TypeormProject {
  // Attributes
  private _tsNodeService?: tsnode.Service;
  private readonly _reader: ConnectionOptionsReader;

  // Constructor
  constructor(readonly root: string) {
    this._reader = new ConnectionOptionsReader({ root });
  }

  // Methods
  private _adaptPattern<T>(pattern: T | string): T | string {
    if (typeof pattern !== 'string') {
      return pattern;
    }

    const adapted = path.join(this.root, pattern);
    logger.debug(`Update pattern ${pattern} => ${adapted}`);

    return adapted;
  }

  protected _adaptOptions(options: ConnectionOptions): ConnectionOptions {
    return {
      ...options,
      logger: new TypeormLogger(),
      entities: options.entities?.map(ent => this._adaptPattern(ent)),
      migrations: options.migrations?.map(mig => this._adaptPattern(mig)),
      subscribers: options.subscribers?.map(sub => this._adaptPattern(sub)),
    };
  }

  protected _setupTsNode() {
    if (!this._tsNodeService) {
      const project = path.join(this.root, 'tsconfig.json');
      this._tsNodeService = tsnode.register({
        project,
        compilerOptions: {
          module: 'commonjs'
        },
        transpileOnly: true
      });

      logger.debug(`Start ts-node service (with ${project})`);
    }
  }

  async getOptions(database = 'default'): Promise<ConnectionOptions> {
    logger.debug(`Loading options for ${database} in ${this.root}`);
    const options = await this._reader.get(database);
    return this._adaptOptions(options);
  }

  async createConnection(options: string | ConnectionOptions): Promise<Connection> {
    // Read options
    if (typeof options === 'string') {
      options = await this.getOptions(options);
    }

    // Start ts-node
    this._setupTsNode();

    // Connect to database
    logger.debug(`Connect to ${options.name || 'default'} connection`);
    return await getConnectionManager().create(options).connect();
  }
}
