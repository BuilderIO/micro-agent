import { intro, outro, log } from '@clack/prompts';
import { generate } from './generate';
import { isFail, test } from './test';
import { green, yellow } from 'kolorist';
import { commandName } from './constants';
import { visualGenerate } from './visual-generate';
import { fileExists } from './file-exists';
import { outputFile } from './output-file';
import { removeBackticks } from './remove-backticks';
import { getSimpleCompletion } from './llm';

type Options = {
  outputFile: string;
  promptFile: string;
  testCommand: string;
  testFile: string;
  lastRunError: string;
  priorCode?: string;
  threadId: string;
  visual: string;
  prompt?: string;
  interactive?: boolean;
  addedLogs?: boolean;
};

export async function runOne(options: Options) {
  if (options.visual) {
    log.step('Running...');
    const result = await visualGenerate(options);
    if (isFail(result.testResult)) {
      if (result.testResult.message.includes('Adding logs to the code')) {
        const codeWithLogs = await addLogsToCode(options);
        await outputFile(options.outputFile, codeWithLogs);
        return {
          code: codeWithLogs,
          testResult: result.testResult,
        };
      }
      const code = result.code;
      await outputFile(options.outputFile, code);
      return {
        code,
        testResult: result.testResult,
      };
    } else {
      return result;
    }
  }

  log.step('Generating code...');

  // TODO: parse any imports in the prompt file and include them in the prompt as context
  const result = removeBackticks(await generate(options));

  await outputFile(options.outputFile, result);
  log.step('Updated code');

  log.step('Running tests...');
  const testResult = await test(options);

  return {
    code: result,
    testResult,
  };
}

export type RunOptions = Options & {
  maxRuns?: number;
};

const useNewlinesInCommand = true;

export function createCommandString(options: RunOptions) {
  const command = [`${commandName}`];
  if (options.outputFile) {
    command.push(options.outputFile);
  }
  const argPrefix = useNewlinesInCommand ? '\\\n  ' : '';
  if (options.promptFile) {
    command.push(argPrefix + `-p ${options.promptFile}`);
  }
  if (options.testCommand) {
    command.push(
      argPrefix + `-t "${options.testCommand.replace(/"/g, '\\"')}"`
    );
  }
  if (options.testFile) {
    command.push(argPrefix + `-f ${options.testFile}`);
  }
  if (options.maxRuns) {
    command.push(argPrefix + `-m ${options.maxRuns}`);
  }
  if (options.threadId) {
    command.push(argPrefix + `--thread ${options.threadId}`);
  }

  return command.join(' ');
}

export async function* run(options: RunOptions) {
  let passed = false;
  const maxRuns = options.maxRuns ?? 20;
  for (let i = 0; i < maxRuns; i++) {
    const result = await runOne(options);
    yield result;

    if (result.testResult.type === 'success') {
      outro(green('All tests passed!'));
      passed = true;
      break;
    }
    options.lastRunError = result.testResult.message;
  }
  if (!passed) {
    log.message(yellow(`Max runs of ${maxRuns} reached.`));
    if (options.prompt && !(await fileExists(options.promptFile))) {
      await outputFile(options.promptFile, options.prompt);
    }
    log.info('You can resume with this command with:');
    console.log(`\n${createCommandString(options)}\n`);
    outro(yellow('Stopping.'));
    console.log('\n');
  }
}

export async function runAll(
  options: RunOptions & {
    skipIntro?: boolean;
  }
) {
  if (!options.skipIntro) {
    intro('🦾 Micro Agent');
  }
  const results = [];
  let testResult;
  if (!options.visual) {
    log.step('Running tests...');
    testResult = await test(options);

    if (testResult.type === 'success') {
      if (options.addedLogs) {
        const codeWithoutLogs = await removeLogsFromCode(options);
        await outputFile(options.outputFile, codeWithoutLogs);
        options.addedLogs = false;
      }
      outro(green('All tests passed!'));
      return;
    }
  }
  for await (const result of run({
    ...options,
    lastRunError: options.lastRunError || testResult?.message || '',
  })) {
    results.push(result);
  }
  return results;
}

async function addLogsToCode(options: Options): Promise<string> {
  const codeWithLogs = await getSimpleCompletion({
    messages: [
      {
        role: 'system',
        content:
          'You are an assistant that helps improve code by adding logs for debugging.',
      },
      {
        role: 'user',
        content: `Please add detailed logs to the following code to help debug repeated test failures:\n\n<code>${options.priorCode}</code>\n\nThe error you received on that code was:\n\n<error>${options.lastRunError}</error>`,
      },
    ],
  });

  return codeWithLogs;
}

async function removeLogsFromCode(options: Options): Promise<string> {
  const codeWithoutLogs = await getSimpleCompletion({
    messages: [
      {
        role: 'system',
        content:
          'You are an assistant that helps clean up code by removing logs.',
      },
      {
        role: 'user',
        content: `Please remove all logs from the following code:\n\n${options.priorCode}`,
      },
    ],
  });
  return codeWithoutLogs;
}
