import os from 'os';
import path from 'path';
import { expect, describe, it, vi } from 'vitest';
import { getConfig, setConfigs } from './config';

const mocks = vi.hoisted(() => {
  return {
    lstat: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
  };
});

vi.mock('fs/promises', () => {
  return {
    default: {
      lstat: mocks.lstat,
      readFile: mocks.readFile,
      writeFile: mocks.writeFile,
    },
  };
});

const configFilePath = path.join(os.homedir(), '.micro-agent');

describe('getConfig', () => {
  const defaultConfig = {
    ANTHROPIC_KEY: undefined,
    ANTHROPIC_MODEL: 'claude-3-opus-20240229',
    LANGUAGE: 'en',
    MODEL: 'gpt-4o',
    OPENAI_API_ENDPOINT: 'https://api.openai.com/v1',
    OPENAI_KEY: undefined,
  };

  it('should return an object with defaults and the env if no config is provided', async () => {
    mocks.lstat.mockRejectedValueOnce(
      new Error('ENOENT: no such file or directory')
    );
    const result = await getConfig();
    expect(result).toEqual({
      ...defaultConfig,
      ...process.env,
    });
  });

  it('should return the parsed config object if a valid config is provided', async () => {
    mocks.lstat.mockRejectedValueOnce(
      new Error('ENOENT: no such file or directory')
    );
    const cliConfig = {
      OPENAI_KEY: 'my-openai-key',
      MODEL: 'gpt-3.5-turbo',
      LANGUAGE: 'en',
    };
    const result = await getConfig(cliConfig);
    expect(result).toEqual({
      ...defaultConfig,
      ...cliConfig,
      ...process.env,
    });
  });

  it('should ignore invalid config keys', async () => {
    mocks.lstat.mockRejectedValueOnce(
      new Error('ENOENT: no such file or directory')
    );
    const cliConfig = {
      OPENAI_KEY: 'my-openai-key',
      INVALID_KEY: 'invalid-value',
    };
    const result = await getConfig(cliConfig);
    expect(result).toEqual({
      ...defaultConfig,
      OPENAI_KEY: 'my-openai-key',
      ...process.env,
    });
  });

  it('should check if the config file exists', async () => {
    mocks.lstat.mockResolvedValueOnce(true);
    mocks.readFile.mockResolvedValueOnce('');

    await getConfig();

    expect(mocks.lstat).toHaveBeenCalledWith(
      configFilePath
    );
  });

  it('should read the config file if it exists', async () => {
    mocks.lstat.mockResolvedValueOnce(true);
    mocks.readFile.mockResolvedValueOnce('');

    await getConfig();

    expect(mocks.readFile).toHaveBeenCalledWith(
      configFilePath,
      'utf8'
    );
  });

  it('should return the parsed config object from the config file', async () => {
    const expected = {
      OPENAI_KEY: 'my-openai-key',
      MODEL: 'gpt-3.5-turbo',
      LANGUAGE: 'en',
    };
    mocks.lstat.mockResolvedValueOnce(true);
    mocks.readFile.mockResolvedValueOnce(
      'OPENAI_KEY=my-openai-key\nMODEL=gpt-3.5-turbo\nLANGUAGE=en\n'
    );

    const result = await getConfig();

    expect(result).toEqual({
      ...defaultConfig,
      ...expected,
      ...process.env,
    });
  });

  it('should ignore invalid config keys in the config file', async () => {
    mocks.lstat.mockResolvedValueOnce(true);
    mocks.readFile.mockResolvedValueOnce(
      'OPENAI_KEY=my-openai-key\nINVALID_KEY=invalid-value\n'
    );
    const result = await getConfig();
    expect(result).toEqual({
      ...defaultConfig,
      OPENAI_KEY: 'my-openai-key',
      ...process.env,
    });
  });
});

describe('setConfigs', () => {
  it('should write the provided key-value pairs to the config file', async () => {
    mocks.lstat.mockResolvedValueOnce(true);
    mocks.readFile.mockResolvedValueOnce('');
    const keyValues: [string, string][] = [
      ['OPENAI_KEY', 'my-openai-key'],
      ['MODEL', 'gpt-3.5-turbo'],
      ['LANGUAGE', 'en'],
    ];

    await setConfigs(keyValues);

    expect(mocks.writeFile).toHaveBeenCalledWith(
      configFilePath,
      'OPENAI_KEY=my-openai-key\nMODEL=gpt-3.5-turbo\nLANGUAGE=en\n',
      'utf8'
    );
  });

  it('should throw an error for invalid config keys', async () => {
    mocks.lstat.mockResolvedValueOnce(true);
    mocks.readFile.mockResolvedValueOnce('');
    const keyValues: [string, string][] = [
      ['OPENAI_KEY', 'my-openai-key'],
      ['INVALID_KEY', 'invalid-value'],
    ];

    await expect(setConfigs(keyValues)).rejects.toThrow(
      'Invalid config property: INVALID_KEY'
    );
  });

});
