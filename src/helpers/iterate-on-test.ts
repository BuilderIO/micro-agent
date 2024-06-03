import { text } from '@clack/prompts';
import { exitOnCancel } from './exit-on-cancel';
import { RunOptions } from './run';
import { removeBackticks } from './remove-backticks';
import { getSimpleCompletion } from './openai';
import { formatMessage } from './test';
import dedent from 'dedent';

export async function iterateOnTest(
  testCode: string,
  options: Partial<RunOptions>
) {
  const prompt = exitOnCancel(
    await text({
      message: 'How should I modify this test code?',
    })
  );

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
          Here is a unit test file generated from the following prompt
          <prompt>
          ${prompt}
          </prompt>

          The test will be located at \`${options.testFile}\` and the code to test will be located at 
          \`${options.outputFile}\`.

          The current test code is:
          <code>
          ${testCode}
          </code>

          The user has given you this feedback on the test. Please update (or completley rewrite,
          if neededed) the test based on the feedback.

          <feedback>
          ${prompt}
          </feedback>

          Please give me new code addressing the feedback.s

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

  if (result.toLowerCase().trim() !== 'good') {
    testContents = await iterateOnTest(testContents, options);
  }

  return testContents;
}
