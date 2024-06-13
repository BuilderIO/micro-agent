import dedent from 'dedent';
import { getCompletion } from './llm';
import { readFile } from 'fs/promises';
import { blue } from 'kolorist';
import { RunOptions } from './run';
import { systemPrompt } from './systemPrompt';

export async function generate(options: RunOptions) {
  const prompt = await readFile(options.promptFile, 'utf-8').catch(() => '');
  const priorCode = await readFile(options.outputFile, 'utf-8').catch(() => '');
  const testCode = await readFile(options.testFile, 'utf-8');

  const packageJson = await readFile('package.json', 'utf-8').catch(() => '');

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

    ${
      packageJson &&
      dedent`
    Don't use any node modules that aren't included here unless specifically told otherwise:
    <package-json>
    ${packageJson}
    </package-json>`
    }

    Please update the code (or generate all new code if needed) to satisfy the prompt and test.

    Be sure to use good coding conventions. For instance, if you are generating a typescript
    file, use types (e.g. for function parameters, etc).

    ${
      !options.interactive &&
      dedent`
        If there is already existing code, strictly maintain the same coding style as the existing code.
        Any updated code should look like its written by the same person/team that wrote the original code.
      `
    }
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
