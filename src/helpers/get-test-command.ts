import dedent from 'dedent';
import { findPackageJson } from './find-package-json';
import { getSimpleCompletion } from './llm';
import { removeBackticks } from './remove-backticks';

export async function getTestCommand({
  testFilePath,
}: {
  testFilePath: string;
}) {
  const defaultTestCommand = `npm test -- ${
    testFilePath.split('/').pop()!.split('.')[0]
  }`;

  const packageJson = await findPackageJson();
  if (!packageJson) {
    return defaultTestCommand;
  }

  const suggestion = removeBackticks(
    await getSimpleCompletion({
      messages: [
        {
          role: 'system',
          content:
            'You take a prompt and return a single line shell command and nothing else',
        },
        {
          role: 'user',
          content: dedent`
            Here is my package.json. I want to run a single command to run the tests (e.g. "npm run test"). The tests should not run in watch mode, they should
            exit once completed. Bonus points if the command only runs this specific test \`${testFilePath}\` such as \`npm test -- ${
            testFilePath.split('/').pop()!.split('.')[0]
          }\`.

            <package-json>
            ${packageJson}
            </package-json>
          `,
        },
      ],
    })
  );

  return suggestion || defaultTestCommand;
}
