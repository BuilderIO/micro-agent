import { cli } from 'cleye';
import { red } from 'kolorist';
import { version } from '../package.json';
import config from './commands/config';
import update from './commands/update';
import chat from './commands/run';
import { commandName } from './helpers/constants';
import { handleCliError } from './helpers/error';
import { run } from './helpers/run';

cli(
  {
    name: commandName,
    version: version,
    flags: {
      prmopt: {
        type: String,
        description: 'Prompt to run',
        alias: 'p',
      },
      test: {
        type: String,
        description: 'The test script to run',
        alias: 't',
      },
    },
    commands: [config, chat, update],
  },
  async (argv) => {
    try {
      const promptText = argv._.join(' ');

      if (promptText.trim() === 'update') {
        update.callback?.(argv);
      } else {
        await run();
      }
    } catch (error: any) {
      console.error(`\n${red('✖')} ${error.message || error}`);
      handleCliError(error);
      process.exit(1);
    }
  }
);
