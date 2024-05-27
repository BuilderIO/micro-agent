import { command } from 'cleye';
import { execaCommand } from 'execa';
import { dim } from 'kolorist';

export default command(
  {
    name: 'update',
    help: {
      description: 'Update Micro Agent to the latest version',
    },
  },
  async () => {
    console.log('');
    const command = `npm update -g @builder.io/micro-agent`;
    console.log(dim(`Running: ${command}`));
    console.log('');
    await execaCommand(command, {
      stdio: 'inherit',
      shell: process.env.SHELL || true,
    }).catch(() => {
      // No need to handle, will go to stderr
    });
    console.log('');
  }
);
