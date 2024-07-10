import { cli } from 'cleye';
import { red } from 'kolorist';
import { version } from '../package.json';
import config from './commands/config';
import update from './commands/update';
import { commandName } from './helpers/constants';
import { handleCliError } from './helpers/error';
import { RunOptions, runAll } from './helpers/run';
import { interactiveMode } from './helpers/interactive-mode';
import { fileExists } from './helpers/file-exists';
import { outro } from '@clack/prompts';
import { isValidProject } from './helpers/validate-project';
import { invalidProjectWarningMessage } from './helpers/invalid-project-warning';

// Suppress punnycode warnings
const originalEmit = process.emitWarning;
process.emitWarning = function (...args) {
  const [warning] = args;
  const warningString = warning.toString();
  // Ignore annoying "punnycode is deprecated" warning that comes
  // from one of our dependencies
  if (warningString.includes('punnycode')) return;
  return originalEmit.apply(process, args as any);
};

cli(
  {
    name: commandName,
    version: version,
    parameters: ['[file path]'],
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
    const filePath = argv._.filePath;
    const fileExtension = filePath?.split('.').pop();
    const testFileExtension =
      fileExtension && ['jsx', 'tsx'].includes(fileExtension as string)
        ? fileExtension?.replace('x', '')
        : fileExtension;

    const createReplacementFilePath = (
      filePath: string,
      fileExtension: string,
      replacement: string
    ) => {
      return filePath.replace(
        new RegExp('\\.' + fileExtension + '$'),
        replacement
      );
    };

    const testFile =
      filePath &&
      fileExtension &&
      createReplacementFilePath(
        filePath,
        fileExtension,
        `.test.${testFileExtension}`
      );
    const specFile =
      filePath &&
      fileExtension &&
      createReplacementFilePath(
        filePath,
        fileExtension,
        `.spec.${testFileExtension}`
      );

    const testFileExists = async () => {
      if (testFile && (await fileExists(testFile))) {
        return testFile;
      } else if (specFile && (await fileExists(specFile))) {
        return specFile;
      }
      return undefined;
    };

    const testFilePath = argv.flags.testFile || (await testFileExists()) || '';
    const promptFilePath =
      argv.flags.prompt ||
      filePath?.replace(new RegExp('\\.' + fileExtension + '$'), '.prompt.md');

    const runOptions: RunOptions = {
      outputFile: filePath!,
      promptFile: promptFilePath || '',
      testCommand: argv.flags.test || '',
      testFile: testFilePath,
      lastRunError: '',
      maxRuns: argv.flags.maxRuns,
      threadId: argv.flags.thread || '',
      visual: argv.flags.visual || '',
    };
    try {
      if (!argv._.filePath || !argv.flags.test) {
        const isValidproject = await isValidProject();

        if (!isValidproject) {
          await invalidProjectWarningMessage();
        } else {
          await interactiveMode(runOptions);
        }
        return;
      }

      await runAll(runOptions);
    } catch (error: any) {
      console.error(`\n${red('✖')} ${error.message || error}`);
      handleCliError(error);
      process.exit(1);
    }
  }
);

process.on('SIGINT', () => {
  console.log('\n');
  outro(red('Stopping.'));
  console.log('\n');
  process.exit();
});
