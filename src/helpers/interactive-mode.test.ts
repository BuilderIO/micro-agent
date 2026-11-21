import { expect, describe, it, vi, beforeEach } from 'vitest';
import { interactiveMode } from './interactive-mode';

const mocks = vi.hoisted(() => {
  return {
    text: vi.fn(),
    getConfig: vi.fn(),
    setConfigs: vi.fn(),
  };
});

vi.mock('@clack/prompts', () => {
  return {
    intro: vi.fn(),
    outro: vi.fn(),
    log: { info: vi.fn() },
    spinner: vi.fn(),
    text: mocks.text,
  };
});

vi.mock('./config', () => {
  return {
    getConfig: mocks.getConfig,
    setConfigs: mocks.setConfigs,
  };
});

const stopAfterKeyPrompt = new Error('stop after key prompt');

describe('interactiveMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    mocks.getConfig.mockResolvedValue({ OPENAI_KEY: undefined });
    mocks.text
      .mockResolvedValueOnce('  my-openai-key  ')
      .mockRejectedValueOnce(stopAfterKeyPrompt);
  });

  it('should require a non-empty OpenAI key', async () => {
    await expect(interactiveMode({})).rejects.toBe(stopAfterKeyPrompt);

    const { validate } = mocks.text.mock.calls[0][0];
    expect(validate(undefined)).toBe('Please enter a key');
    expect(validate('')).toBe('Please enter a key');
    expect(validate('   ')).toBe('Please enter a key');
    expect(validate('my-openai-key')).toBeUndefined();
  });

  it('should save the trimmed OpenAI key', async () => {
    await expect(interactiveMode({})).rejects.toBe(stopAfterKeyPrompt);

    expect(mocks.setConfigs).toHaveBeenCalledWith([
      ['OPENAI_KEY', 'my-openai-key'],
    ]);
  });

  it('should not ask for the OpenAI key if it is already set', async () => {
    mocks.getConfig.mockResolvedValue({ OPENAI_KEY: 'existing-key' });
    mocks.text.mockReset().mockRejectedValueOnce(stopAfterKeyPrompt);

    await expect(interactiveMode({})).rejects.toBe(stopAfterKeyPrompt);

    expect(mocks.setConfigs).not.toHaveBeenCalled();
    expect(mocks.text.mock.calls[0][0].message).toBe(
      'What would you like to do?'
    );
  });
});
