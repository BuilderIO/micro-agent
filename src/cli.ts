import { cli } from 'cleye';
import { red } from 'kolorist';
import { version } from '../package.json';
import config from './commands/config';
import update from './commands/update';
import chat from './commands/run';
import { commandName } from './helpers/constants';
import { handleCliError } from './helpers/error';
import { runAll } from './helpers/run';

cli(
  {
    name: commandName,
    version: version,
    parameters: ['<file path>'],
    flags: {
      prompt: {
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
        // TODO: throw errors if flags not provided or move
        // them to parameters https://github.com/privatenumber/cleye?tab=readme-ov-file#about
        await runAll({
          outputFile: argv._.filePath,
          promptFile: argv.flags.prompt!,
          testCommand: argv.flags.test!,
        });
      }
    } catch (error: any) {
      console.error(`\n${red('✖')} ${error.message || error}`);
      handleCliError(error);
      process.exit(1);
    }
  }
);
