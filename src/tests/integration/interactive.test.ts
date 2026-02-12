import { execaCommand } from 'execa';
import { lstat, readFile, writeFile } from 'fs/promises';
import { beforeAll, describe, expect, it } from 'vitest';

const configPath = `${process.env.HOME}/.micro-agent`;

const checkConfigFileExists = async () => {
  return await lstat(configPath)
    .then(() => true)
    .catch(() => false);
};

describe('interactive cli', () => {
  beforeAll(async () => {
    const configFileExists = await checkConfigFileExists();
    if (!configFileExists) {
      await writeFile(
        configPath,
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

  it('should ask for an OpenAI key if configured key is cancel', async () => {
    const previousConfig = await readFile(configPath, 'utf8');
    await writeFile(configPath, 'OPENAI_KEY=cancel');

    try {
      const result = await execaCommand('jiti ./src/cli.ts', {
        input: '\x03',
        shell: process.env.SHELL || true,
        env: {
          ...process.env,
          OPENAI_KEY: '',
        },
      });

      const output = result.stdout;
      expect(output).toContain('Welcome newcomer! What is your OpenAI key?');
    } finally {
      await writeFile(configPath, previousConfig);
    }
  });
});
