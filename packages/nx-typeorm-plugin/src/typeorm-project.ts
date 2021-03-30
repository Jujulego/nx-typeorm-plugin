import { Connection, ConnectionOptions, ConnectionOptionsReader, getConnectionManager } from 'typeorm';
import * as path from 'path';
import * as tsnode from 'ts-node';

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

    return path.join(path.resolve(this.root), pattern);
  }

  protected _adaptOptions(options: ConnectionOptions): ConnectionOptions {
    return {
      ...options,
      entities: options.entities?.map(ent => this._adaptPattern(ent)),
      migrations: options.migrations?.map(mig => this._adaptPattern(mig)),
      subscribers: options.subscribers?.map(sub => this._adaptPattern(sub)),
    };
  }

  protected _setupTsNode() {
    if (!this._tsNodeService) {
      this._tsNodeService = tsnode.register({
        project: path.join(this.root, 'tsconfig.json'),
        compilerOptions: {
          module: 'commonjs'
        },
        transpileOnly: true
      });
    }
  }

  async getOptions(database = 'default'): Promise<ConnectionOptions> {
    const options = await this._reader.get(database);
    return this._adaptOptions(options);
  }

  async createConnection(options: string | ConnectionOptions): Promise<Connection> {
    if (typeof options === 'string') {
      options = await this.getOptions(options);
    }

    this._setupTsNode();
    return await getConnectionManager().create(options).connect();
  }
}
