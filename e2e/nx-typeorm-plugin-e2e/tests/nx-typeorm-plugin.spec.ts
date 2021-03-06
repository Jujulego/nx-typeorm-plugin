import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';

describe('nx-typeorm-plugin e2e', () => {
  it('should create nx-typeorm-plugin', async (done) => {
    const plugin = uniq('nx-typeorm-plugin');
    ensureNxProject(
      '@jujulego/nx-typeorm-plugin',
      'dist/packages/nx-typeorm-plugin'
    );
    await runNxCommandAsync(
      `generate @jujulego/nx-typeorm-plugin:nx-typeorm-plugin ${plugin}`
    );

    const result = await runNxCommandAsync(`build ${plugin}`);
    expect(result.stdout).toContain('Executor ran');

    done();
  });

  describe('--directory', () => {
    it('should create src in the specified directory', async (done) => {
      const plugin = uniq('nx-typeorm-plugin');
      ensureNxProject(
        '@jujulego/nx-typeorm-plugin',
        'dist/packages/nx-typeorm-plugin'
      );
      await runNxCommandAsync(
        `generate @jujulego/nx-typeorm-plugin:nx-typeorm-plugin ${plugin} --directory subdir`
      );
      expect(() =>
        checkFilesExist(`libs/subdir/${plugin}/src/index.ts`)
      ).not.toThrow();
      done();
    });
  });

  describe('--tags', () => {
    it('should add tags to nx.json', async (done) => {
      const plugin = uniq('nx-typeorm-plugin');
      ensureNxProject(
        '@jujulego/nx-typeorm-plugin',
        'dist/packages/nx-typeorm-plugin'
      );
      await runNxCommandAsync(
        `generate @jujulego/nx-typeorm-plugin:nx-typeorm-plugin ${plugin} --tags e2etag,e2ePackage`
      );
      const nxJson = readJson('nx.json');
      expect(nxJson.projects[plugin].tags).toEqual(['e2etag', 'e2ePackage']);
      done();
    });
  });
});
