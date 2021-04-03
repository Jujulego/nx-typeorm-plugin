import { DBCreateExecutorSchema } from './schema';
import executor from './executor';

const options: DBCreateExecutorSchema = {};

describe('DbCreate Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
