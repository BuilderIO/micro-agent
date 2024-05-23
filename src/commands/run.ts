import { command } from 'cleye';
import { run } from '../helpers/run';

export default command(
  {
    name: 'run',
    help: {
      description: 'Run the micro agent from the given prompt and test script.',
    },
  },
  async () => {
    await run();
  }
);
