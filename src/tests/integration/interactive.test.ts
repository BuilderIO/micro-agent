import { execaCommand } from 'execa';
import { lstat, writeFile } from 'fs/promises';
import { beforeAll, describe, expect, it } from 'vitest';

const checkConfigFileExists = async () => {
  return await lstat(`${process.env.HOME}/.micro-agent`)
    .then(() => true)
    .catch(() => false);
};

describe('interactive cli', () => {
  beforeAll(async () => {
    const configFileExists = await checkConfigFileExists();
    if (!configFileExists) {
      await writeFile(
        `${process.env.HOME}/.micro-agent`,
        'OPENAI_KEY=sk-1234567890abcdef1234567890abcdef'
      );
    }
  });
  it('should start interactive mode with an intro', async () => {
    const result = await execaCommand('jiti ./src/cli.ts', {
      input: '\x03',
      shell: process.env.SHELL || true,
    });

    const output = result.stdout;

    expect(output).toContain('🦾 Micro Agent');
  });

  it('should ask for an OpenAI key if not set', async () => {
    // Rename the config file to simulate a fresh install
    await execaCommand('mv ~/.micro-agent ~/.micro-agent.bak', {
      shell: process.env.SHELL || true,
    });
    const result = await execaCommand('jiti ./src/cli.ts', {
      input: '\x03',
      shell: process.env.SHELL || true,
    });

    const output = result.stdout;

    expect(output).toContain('Welcome newcomer! What is your OpenAI key?');

    // Restore the config file
    await execaCommand('mv ~/.micro-agent.bak ~/.micro-agent', {
      shell: process.env.SHELL || true,
    });
  });

  it('should ask for a prompt', async () => {
    const result = await execaCommand('jiti ./src/cli.ts', {
      input: '\x03',
      shell: process.env.SHELL || true,
    });

    const output = result.stdout;

    expect(output).toContain('What would you like to do?');
  });
});
