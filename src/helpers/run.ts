import { intro, note, outro, spinner, log } from '@clack/prompts';
import { generate } from './generate';
import { test } from './test';
import { writeFile } from 'fs/promises';
import { green, yellow } from 'kolorist';
import { commandName } from './constants';

type Options = {
  outputFile: string;
  promptFile: string;
  testCommand: string;
  testFile: string;
  lastRunError: string;
  priorCode?: string;
  threadId: string;
};

export async function runOne(options: Options) {
  const generatingSpinner = spinner();
  generatingSpinner.start('Generating code...');

  // TODO: parse any imports in the prompt file and include them in the prompt as context
  const result = await generate(options);

  await writeFile(options.outputFile, result);
  generatingSpinner.stop('Updated code');

  log.step('Running tests...');
  console.log('◇');
  console.log('\n');
  const testResult = await test(options.testCommand);
  console.log('◇');
  return {
    code: result,
    testResult,
  };
}

export type RunOptions = Options & {
  maxRuns?: number;
};

const useNewlinesInCommand = true;

function createCommandString(options: RunOptions) {
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
  const maxRuns = options.maxRuns ?? 10;
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
    log.message(yellow(`Max runs of ${maxRuns} reached, stopping.`));
    note(
      `${createCommandString(options)}`,
      'You can resume with this command with:'
    );
    outro();
  }
}

export async function runAll(options: RunOptions) {
  intro('Running agent...');
  const results = [];
  log.step('Running tests...');
  console.log('\n');
  const testResult = await test(options.testCommand);

  console.log('◇');
  if (testResult.type === 'success') {
    outro(green('All tests passed!'));
    return;
  }
  for await (const result of run({
    ...options,
    lastRunError: options.lastRunError || testResult.message,
  })) {
    results.push(result);
  }
  return results;
}
