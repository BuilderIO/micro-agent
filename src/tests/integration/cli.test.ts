import { execaCommand } from 'execa';
import { readFile, writeFile } from 'fs/promises';
import { afterEach, describe, expect, it } from 'vitest';
import { removeBackticks } from '../../helpers/remove-backticks';

const integrationTestPath = 'src/tests/integration';

describe('cli', () => {
  it('should run with mock LLM', async () => {
    // Write the test file using the mock LLM record
    const mockLlmRecordFile = 'test/fixtures/add.json';
    const mockLlmRecordFileContents = await readFile(
      mockLlmRecordFile,
      'utf-8'
    );
    const jsonLlmRecording = JSON.parse(mockLlmRecordFileContents.toString());

    const testContents = jsonLlmRecording.completions[1].output;
    await writeFile(
      `${integrationTestPath}/add.test.ts`,
      removeBackticks(testContents)
    );

    // Execute the CLI command
    const result = await execaCommand(
      `USE_MOCK_LLM=true MOCK_LLM_RECORD_FILE=test/fixtures/add.json jiti ./src/cli.ts ${integrationTestPath}/add.ts -f ${integrationTestPath}/add.test.ts -t "npm run test:all -- add"`,
      {
        input: '\x03',
        shell: process.env.SHELL || true,
      }
    );

    const output = result.stdout;

    // Check the output
    expect(output).toContain('add is not a function');
    expect(output).toContain('Generating code...');
    expect(output).toContain('Updated code');
    expect(output).toContain('Running tests...');
    expect(output).toContain(`6 passed`);
    expect(output).toContain('All tests passed!');
  });

  it('should work on spec file', async () => {
    await writeFile(
      `${integrationTestPath}/add.test.ts`,
      "import { test, expect } from 'vitest';\n\ntest('pass', () => {\nexpect(true)\n});"
    );

    // Write the test file using the mock LLM record
    const mockLlmRecordFile = 'test/fixtures/add.json';
    const mockLlmRecordFileContents = await readFile(
      mockLlmRecordFile,
      'utf-8'
    );
    const jsonLlmRecording = JSON.parse(mockLlmRecordFileContents.toString());

    const testContents = jsonLlmRecording.completions[1].output;
    await writeFile(
      `${integrationTestPath}/add.spec.ts`,
      removeBackticks(testContents)
    );

    // Execute the CLI command
    const result = await execaCommand(
      `USE_MOCK_LLM=true MOCK_LLM_RECORD_FILE=test/fixtures/add.json jiti ./src/cli.ts ${integrationTestPath}/add.ts -f ${integrationTestPath}/add.spec.ts -t "npm run test:all -- add"`,
      {
        input: '\x03',
        shell: process.env.SHELL || true,
      }
    );

    const output = result.stdout;

    // Check the output
    expect(output).toContain('add is not a function');
    expect(output).toContain('Generating code...');
    expect(output).toContain('Updated code');
    expect(output).toContain('Running tests...');
    expect(output).toContain(`7 passed`);
    expect(output).toContain('All tests passed!');
  });

  afterEach(async () => {
    await writeFile(`${integrationTestPath}/add.ts`, '');
    await writeFile(`${integrationTestPath}/add.test.ts`, '');
    await writeFile(
      `${integrationTestPath}/add.spec.ts`,
      "import {describe, test} from 'vitest'\n describe('spec', () => {test.todo('please pass');});"
    );
  });
});
