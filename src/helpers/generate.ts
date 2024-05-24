import dedent from 'dedent';
import { getCompletion } from './openai';
import { readFile } from 'fs/promises';
import { blue } from 'kolorist';

export async function generate(options: {
  promptFile: string;
  outputFile: string;
  testFile: string;
  lastRunError?: string;
}) {
  const prompt = await readFile(options.promptFile, 'utf-8');
  const priorCode = await readFile(options.outputFile, 'utf-8').catch(() => '');
  const testCode = await readFile(options.testFile, 'utf-8');

  const userPrompt = dedent`
    Here is what I need:

    <prompt>
    ${prompt}
    </prompt>

    The previous code you generated was:
    <code>
    ${priorCode || 'None'}
    </code>

    The test code that needs to pass is:
    <test>
    ${testCode}
    </test>

    The error you received on that code was:
    <error>
    ${options.lastRunError || 'None'}
    </error>

    Please give me the code that satisfies the prompt and test.
  `;

  if (process.env.DEBUG) {
    console.log(`\n\n\n${blue('Prompt:')}`, userPrompt, '\n\n\n');
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (await getCompletion({
    messages: [
      {
        role: 'system',
        content:
          'You take a prompt and test and generate code accordingly. You only output typescript code and nothing else. Output just a typescript string, like "const hello = \'world\'", not markdown. Be sure your code exports function that can be called by an external test file. Make sure your code is reusable and not overly hardcoded to match the promt.',
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  }))!;
}
