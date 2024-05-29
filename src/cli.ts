import { cli } from 'cleye';
import { red } from 'kolorist';
import { version } from '../package.json';
import config from './commands/config';
import update from './commands/update';
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
      testFile: {
        type: String,
        description: 'The test file to run',
        alias: 'f',
      },
      maxRuns: {
        type: Number,
        description: 'The maximum number of runs to attempt',
        alias: 'm',
      },
      thread: {
        type: String,
        description: 'Thread ID to resume',
      },
      visual: {
        type: String,
        description:
          'Visually diff a local screenshot with the result of this URL',
        alias: 'v',
      },
    },
    commands: [config, update],
  },
  async (argv) => {
    try {
      const filePath = argv._.filePath;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const fileExtension = filePath.split('.').pop()!;
      const testFileExtension = ['jsx', 'tsx'].includes(fileExtension as any)
        ? fileExtension.replace('x', '')
        : fileExtension;

      const testFilePath =
        argv.flags.testFile ||
        filePath.replace(
          new RegExp('\\.' + fileExtension + '$'),
          `.test.${testFileExtension}`
        );
      const promptFilePath =
        argv.flags.prompt ||
        filePath.replace(new RegExp('\\.' + fileExtension + '$'), '.prompt.md');

      await runAll({
        outputFile: filePath,
        promptFile: promptFilePath,
        testCommand: argv.flags.test || 'npm test',
        testFile: testFilePath,
        lastRunError: '',
        maxRuns: argv.flags.maxRuns,
        threadId: argv.flags.thread || '',
        visual: argv.flags.visual || '',
      });
    } catch (error: any) {
      console.error(`\n${red('✖')} ${error.message || error}`);
      handleCliError(error);
      process.exit(1);
    }
  }
);
