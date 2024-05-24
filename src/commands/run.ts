import { command } from 'cleye';
import { runAll } from '../helpers/run';
import { handleCliError } from '../helpers/error';
import { red } from 'kolorist';

export default command(
  {
    name: 'run',
    help: {
      description: 'Run the micro agent from the given prompt and test script.',
    },
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
  },
  async (argv) => {
    try {
      // TODO: throw errors if flags not provided or move
      // them to parameters https://github.com/privatenumber/cleye?tab=readme-ov-file#about
      await runAll({
        outputFile: argv._.filePath,
        promptFile: argv.flags.prompt!,
        testCommand: argv.flags.test!,
      });
    } catch (error: any) {
      console.error(`\n${red('✖')} ${error.message || error}`);
      handleCliError(error);
      process.exit(1);
    }
  }
);
