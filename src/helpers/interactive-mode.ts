import { intro, log, spinner, text } from '@clack/prompts';

import { glob } from 'glob';
import { RunOptions, runAll } from './run';
import { getFileSuggestion, getSimpleCompletion } from './llm';
import { getConfig, setConfigs } from './config';
import { readFile, writeFile } from 'fs/promises';
import dedent from 'dedent';
import { removeBackticks } from './remove-backticks';
import { formatMessage } from './test';
import { gray, green } from 'kolorist';
import { exitOnCancel } from './exit-on-cancel';
import { iterateOnTest } from './iterate-on-test';

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

  let testContents = removeBackticks(
    (await getSimpleCompletion({
      onChunk: (chunk) => {
        process.stderr.write(formatMessage(chunk));
      },
      messages: [
        {
          role: 'system',
          content:
            'You return code for a unit test only. No other words, just the code',
        },
        {
          role: 'user',
          content: dedent`
          Please give me a unit test file (can be multiple tests) for the following prompt:
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
  await writeFile(testFilePath, testContents);
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
