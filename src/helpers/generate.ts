import dedent from 'dedent';
import { getCompletion } from './openai';
import { readFile } from 'fs/promises';

export async function generate(options: {
  promptFile: string;
  priorCode?: string;
  lastRunError?: string;
}) {
  const prompt = await readFile(options.promptFile, 'utf-8');

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (await getCompletion({
    messages: [
      {
        role: 'system',
        content:
          'You take a prompt and test and generate code accordingly. You only output typescript code and nothing else. Output just a typescript string, like "const hello = \'world\'", not markdown',
      },
      {
        role: 'user',
        content: dedent`
          Here is what I need:

          <prompt>
          ${prompt}
          </prompt>

          The previous code you generated was:
          <code>
          ${options.priorCode || 'None'}
          </code>

          The error you received on that code was:
          <error>
          ${options.lastRunError || 'None'}
          </error>

          Please give me the code that satisfies the prompt and test.
        `,
      },
    ],
  }))!;
}
