import dedent from 'dedent';
import { getDependencyFile, getDependencyFileName } from './dependency-files';
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

  const testFileExtension = testFilePath.split('.').pop();
  const dependencyFileName = getDependencyFileName(testFileExtension);
  const dependencyFileContent = await getDependencyFile(
    process.cwd(),
    testFileExtension
  );
  if (!dependencyFileContent) {
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
            Here is my ${dependencyFileName}. I want to run a single command to execute the tests. The tests should not run in watch mode.
            If there is a test script in the ${dependencyFileName}, use that script. For example, \`npm test\`.
            The command should filter and run the specific test file at \`${testFilePath}\`. For example, \`npm test -- ${
            testFilePath.split('/').pop()!.split('.')[0]
          }\`.

            Here are sample test commands without watch mode that work for some popular testing libraries:
            - Jest: \`npm test -- ${
              testFilePath.split('/').pop()!.split('.')[0]
            } --no-watch \`
            - Vitest: \`npm test -- ${
              testFilePath.split('/').pop()!.split('.')[0]
            } --run \`
            - minitest: \`rails test ${
              testFilePath.split('/').pop()!.split('.')[0]
            }\`
            - rspec: \`rspec ${testFilePath.split('/').pop()!.split('.')[0]}\`
            - pytest: \`pytest ${testFilePath.split('/').pop()!.split('.')[0]}\`
            - unittest: \`python -m unittest ${
              testFilePath.split('/').pop()!.split('.')[0]
            }\`

            <${dependencyFileName.replace('.', '-')}>
            ${dependencyFileContent}
            </${dependencyFileName.replace('.', '-')}>

            If no testing libraries are found in the package.json, use \`npx vitest run ${
              testFilePath.split('/').pop()!.split('.')[0]
            }\` as a fallback.
          `,
        },
      ],
    })
  );

  return suggestion || defaultTestCommand;
}
