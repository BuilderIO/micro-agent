import * as p from '@clack/prompts';
import { outro } from '@clack/prompts';
import { execaCommand } from 'execa';
import { dim, yellow } from 'kolorist';

export async function invalidProjectWarningMessage() {
  console.warn(
    yellow(
      'Warning: The current directory does not appear to be a recognized project folder.'
    )
  );

  const choice = await p.select({
    message: 'Want to setup a new project?',
    options: [
      {
        label: 'Node + Vitest project',
        value: 'node-vitest',
      },
      {
        label: 'Exit',
        value: 'cancel',
      },
    ],
  });

  if (choice === 'node-vitest') {
    const command = `npm init -y && npm install typescript tsx @types/node vitest -D && npx tsc --init`;

    console.log('');

    console.log(dim(`Running: ${command}`));

    await execaCommand(command, {
      stdio: 'inherit',
      shell: process.env.SHELL || true,
    }).catch(() => {
      // No need to handle, will go to stderr
    });

    process.exit();
  } else if (choice === 'cancel') {
    outro('Goodbye!');
    process.exit(0);
  }

  process.exit();
}
