import { intro, note, outro, spinner } from '@clack/prompts';
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
  const s = spinner();
  s.start('Generating code...');

  // TODO: parse any imports in the prompt file and include them in the prompt as context
  const result = await generate(options);

  await writeFile(options.outputFile, result);
  s.stop('Updated code');

  s.start('Running tests...');
  console.log('\n\n\n');
  const testResult = await test(options.testCommand);

  if (testResult.type === 'fail') {
    console.log('\n\n\n');
  }

  return {
    code: result,
    testResult,
  };
}

export type RunOptions = Options & {
  maxRuns?: number;
};

function createCommandString(options: RunOptions) {
  const command = [`${commandName}`];
  if (options.outputFile) {
    command.push(options.outputFile);
  }
  if (options.promptFile) {
    command.push(`-p ${options.promptFile}`);
  }
  if (options.testCommand) {
    command.push(`-t "${options.testCommand.replace(/"/g, '\\"')}"`);
  }
  if (options.testFile) {
    command.push(`-f ${options.testFile}`);
  }
  if (options.maxRuns) {
    command.push(`-m ${options.maxRuns}`);
  }
  if (options.threadId) {
    command.push(`--thread ${options.threadId}`);
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
    outro(yellow(`Max runs of ${maxRuns} reached, stopping.`));
    note(`You can resume with ${createCommandString(options)}`);
    note(`You can set a higher max runs with -m <number>`);
  }
}

export async function runAll(options: RunOptions) {
  intro('Running agent...');
  const results = [];
  const testResult = await test(options.testCommand);
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
