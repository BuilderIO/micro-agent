import { intro, log, spinner, text } from '@clack/prompts';

import { glob } from 'glob';
import { RunOptions, runAll } from './run';
import { getFileSuggestion, getSimpleCompletion } from './llm';
import { getConfig, setConfigs } from './config';
import { readFile } from 'fs/promises';
import dedent from 'dedent';
import { formatMessage } from './test';
import { gray, green } from 'kolorist';
import { exitOnCancel } from './exit-on-cancel';
import { iterateOnTest } from './iterate-on-test';
import { outputFile } from './output-file';

export async function interactiveMode(options: Partial<RunOptions>) {
  console.log('');
  intro('🦾 Micro Agent');

  const config = await getConfig();

  if (!config.OPENAI_KEY) {
    const openaiKey = exitOnCancel(
      await text({
        message: `Welcome newcomer! What is your OpenAI key? ${gray(
          '(this is kept private)'
        )}`,
      })
    );

    await setConfigs([['OPENAI_KEY', openaiKey as string]]);
  }

  const prompt = exitOnCancel(
    await text({
      message: 'What would you like to do?',
      placeholder: 'A function that ...',
    })
  );

  let filePath = options.outputFile;
  if (!filePath) {
    const files = await glob('*/*/*', { ignore: ['node_modules/**'] });
    const fileString = files.slice(0, 100).join('\n');
    const loading = spinner();
    loading.start();

    const recommendedFilePath = await getFileSuggestion(prompt, fileString);
    loading.stop();

    filePath = exitOnCancel(
      await text({
        message: 'What file would you like to create or edit?',
        defaultValue: recommendedFilePath!,
        placeholder: recommendedFilePath!,
      })
    );
  }

  log.info('Generating test...');

  process.stdout.write(formatMessage('\n'));

  const exampleTests = await glob('**/*.{test,spec}.*', {
    ignore: ['node_modules/**'],
  });
  const twoTests = exampleTests.slice(0, 2);
  const twoTestFiles = await Promise.all(
    twoTests.map(async (test) => {
      const content = await readFile(test, 'utf8');
      return content;
    })
  );

  const packageJsonContents = await readFile('package.json', 'utf8').catch(
    () => ''
  );

  const testFilePath = filePath.replace(/.(\w+)$/, '.test.$1');

  let testContents = getCodeBlock(
    (await getSimpleCompletion({
      onChunk: (chunk) => {
        process.stderr.write(formatMessage(chunk));
      },
      messages: [
        {
          role: 'system',
          content: dedent`
      You are an AI assistant that given a user prompt, returns a markdown for a unit test.
      1. Think step by step before emiting any code. Think about the shape of the input and output, the behavior and special situations that are relevant to the algorithm.

      2. After planning, return a code block with the test code.
        - Start with the most basic test case and progress to more complex ones.
        - Start with the happy path, then edge cases.
        - Inputs that are invalid, and likely to break the algorithm.
        - Keep the individual tests small and focused.
        - Focus in behavior, not implementation.

        Stop emitting after the code block.`,
        },
        {
          role: 'user',
          content: dedent`
          Please prepare a unit test file (can be multiple tests) for the following prompt:
          <prompt>
          ${prompt}
          </prompt>

          The test will be located at \`${testFilePath}\` and the code to test will be located at
          \`${filePath}\`.

          ${
            twoTests.length > 0
              ? dedent`Here is a copy of a couple example tests in the repo:
            <tests>
            ${twoTestFiles.join('\n') || 'No tests found'}
            </tests>`
              : packageJsonContents
              ? dedent`
                Here is the package.json file to help you know what testing library to use (if any, otherwise use the built-in nodejs testing tools):
                <package-json>
                ${packageJsonContents}
                </package-json>
              `
              : ''
          }

          Only output the test code. No other words, just the code.
          `,
        },
      ],
    }))!
  );

  const result = exitOnCancel(
    await text({
      message:
        'How does the generated test look? Reply "good", or provide feedback',
      defaultValue: 'good',
      placeholder: 'good',
    })
  );

  const defaultTestCommand = `npm test -- ${
    testFilePath.split('/').pop()!.split('.')[0]
  }`;

  if (result.toLowerCase().trim() !== 'good') {
    options.testFile = testFilePath;
    options.outputFile = filePath;
    options.prompt = prompt;
    testContents = await iterateOnTest({
      testCode: testContents,
      feedback: result,
      options,
    });
  }

  // TODO: generate dir if one doesn't exist yet
  await outputFile(testFilePath, testContents);
  log.success(`${green('Test file generated!')} ${gray(`${testFilePath}`)}`);
  const testCommand = exitOnCancel(
    await text({
      message: 'What command should I run to test the code?',
      defaultValue: defaultTestCommand,
      placeholder: defaultTestCommand,
    })
  );

  log.info(`Agent running...`);

  await runAll({
    skipIntro: true,
    threadId: options.threadId || '',
    maxRuns: options.maxRuns || 20,
    visual: options.visual || '',
    ...options,
    testCommand: testCommand,
    outputFile: filePath,
    testFile: testFilePath,
    promptFile: filePath.replace(/.(\w+)$/, '.prompt.md'),
    prompt,
    lastRunError: '',
  });
}

export function getCodeBlock(output: string) {
  const foundCode = output.indexOf('```');
  if (foundCode === -1) {
    return output;
  }
  const start = output.indexOf('\n', foundCode);
  if (start === -1) {
    return output.slice(foundCode);
  }
  const end = output.indexOf('```', start);
  if (end === -1) {
    console.error('Code block end not found');
  }
  return output.slice(start, end === -1 ? undefined : end).trim();
}
