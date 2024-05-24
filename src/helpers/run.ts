import { generate } from './generate';
import { test } from './test';
import { writeFile } from 'fs/promises';

type Options = {
  outputFile: string;
  promptFile: string;
  testCommand: string;
  lastRunError?: string;
  priorCode?: string;
};

export async function runOne(options: Options) {
  // TODO: parse any imports in the prompt file and include them in the prompt as context
  const result = await generate(options);

  await writeFile(options.outputFile, result);

  const testResult = await test(options.testCommand);

  return {
    code: result,
    testResult,
  };
}

export type RunOptions = Options & {
  maxRuns?: number;
};

export async function* run(options: RunOptions) {
  const maxRuns = options.maxRuns ?? 10;
  for (let i = 0; i < maxRuns; i++) {
    const result = await runOne(options);
    yield result;

    if (result.testResult.type === 'success') {
      break;
    }
    options.lastRunError = result.code;
  }
}

export async function runAll(options: RunOptions) {
  const results = [];
  for await (const result of run(options)) {
    results.push(result);
  }
  return results;
}
