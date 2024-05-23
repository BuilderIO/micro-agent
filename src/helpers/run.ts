import { generate } from './generate';
import { test } from './test';

type Options = {
  promptFile: string;
  testCommand: string;
  lastRunError?: string;
  priorCode?: string;
};

export async function runOne(options: Options) {
  const result = await generate(options);

  const testResult = await test(options.testCommand);
  console.log('testResult', testResult);
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
