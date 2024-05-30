import dedent from 'dedent';
import { getCompletion } from './openai';
import { readFile } from 'fs/promises';
import { blue } from 'kolorist';
import { RunOptions } from './run';

export const systemPrompt =
  'You take a prompt and test and generate code accordingly. You only output code and nothing else - your output just a code string, like "const hello = \'world\'", not markdown (aka do NOT put three backticks around the code). Be sure your code exports function that can be called by an external test file. Make sure your code is reusable and not overly hardcoded to match the promt. Use two spaces for indents. Add logs if helpful for debugging, you will get the log output on your next try to help you debug.';

export async function generate(options: RunOptions) {
  const prompt = await readFile(options.promptFile, 'utf-8').catch(() => '');
  const priorCode = await readFile(options.outputFile, 'utf-8').catch(() => '');
  const testCode = await readFile(options.testFile, 'utf-8');

  const userPrompt = dedent`
    Here is what I need:

    <prompt>
    ${prompt || 'Pass the tests'}
    </prompt>

    The current code is:
    <code>
    ${priorCode || 'None'}
    </code>

    The file path for the above is ${options.outputFile}.

    The test code that needs to pass is:
    <test>
    ${testCode}
    </test>

    The file path for the test is ${options.testFile}.

    The error you received on that code was:
    <error>
    ${options.lastRunError || 'None'}
    </error>

    Please give me the code that satisfies the prompt and test.
  `;

  if (process.env.MA_DEBUG) {
    console.log(`\n\n${blue('Prompt:')}`, userPrompt, '\n\n');
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (await getCompletion({
    options,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  }))!;
}
