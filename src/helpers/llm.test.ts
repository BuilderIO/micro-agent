import {
  getCompletion,
  getOpenAi,
  getSimpleCompletion,
  getFileSuggestion,
} from './llm';
import { KnownError } from './error';
import { expect, describe, it, vi } from 'vitest';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { RunOptions } from './run';
import { gray } from 'kolorist';

const mocks = vi.hoisted(() => {
  return {
    openAIConstructor: vi.fn(),
    getConfig: vi.fn(),
    create: vi.fn(),
  };
});

vi.mock('./config', () => {
  return {
    getConfig: mocks.getConfig,
  };
});

vi.mock('openai', () => {
  return {
    default: mocks.openAIConstructor,
  };
});

mocks.openAIConstructor.mockImplementation(() => {
  return {
    chat: {
      completions: {
        create: mocks.create,
      },
    },
  };
});

const defaultConfig = {
  OPENAI_KEY: 'my-openai-key',
  OPENAI_API_ENDPOINT: 'https://api.openai.com/v1',
};

describe('getOpenAi', () => {
  it('should throw a KnownError if OPENAI_KEY is blank', async () => {
    mocks.getConfig
      .mockResolvedValueOnce({ OPENAI_KEY: '' })
      .mockResolvedValueOnce({ OPENAI_KEY: '' });

    await expect(getOpenAi()).rejects.toThrow(KnownError);
    await expect(getOpenAi()).rejects.toThrow(
      'Missing OpenAI key. Use `micro-agent config` to set it.'
    );
  });

  it('should create a new OpenAI instance with the provided key and endpoint', async () => {
    mocks.getConfig.mockResolvedValueOnce(defaultConfig);

    await getOpenAi();

    expect(OpenAI).toHaveBeenCalledWith({
      apiKey: 'my-openai-key',
      baseURL: 'https://api.openai.com/v1',
    });
  });
});

describe('getSimpleCompletion', () => {
  it('should call openai.chat.completions.create with the correct parameters', async () => {
    mocks.getConfig
      .mockResolvedValueOnce(defaultConfig)
      .mockResolvedValueOnce(defaultConfig);
    mocks.create.mockResolvedValueOnce([]);

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: 'Hello' },
    ];
    await getSimpleCompletion({ messages });

    expect(mocks.create).toHaveBeenCalledWith({
      model: 'gpt-4o',
      messages,
      stream: true,
      seed: 42,
      temperature: 0,
    });
  });

  it('should concatenate the output from completion chunks', async () => {
    mocks.getConfig
      .mockResolvedValueOnce(defaultConfig)
      .mockResolvedValueOnce(defaultConfig);
    mocks.create.mockResolvedValueOnce([
      { choices: [{ delta: { content: 'Hello' } }] },
      { choices: [{ delta: { content: ' World' } }] },
    ]);

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: 'Hello' },
    ];
    const output = await getSimpleCompletion({ messages });

    expect(output).toBe('Hello World');
  });

  it('should call options.onChunk for each chunk', async () => {
    mocks.getConfig
      .mockResolvedValueOnce(defaultConfig)
      .mockResolvedValueOnce(defaultConfig);
    mocks.create.mockResolvedValueOnce([
      { choices: [{ delta: { content: 'Hello' } }] },
      { choices: [{ delta: { content: ' World' } }] },
    ]);

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: 'Hello' },
    ];
    const onChunk = vi.fn();
    const output = await getSimpleCompletion({ messages, onChunk });

    expect(onChunk).toHaveBeenCalledTimes(2);
    expect(onChunk).toHaveBeenCalledWith('Hello');
    expect(onChunk).toHaveBeenCalledWith(' World');
  });
});

describe('getCompletion', () => {
  it('should call openai.chat.completions.create with the correct parameters', async () => {
    mocks.getConfig
      .mockResolvedValueOnce(defaultConfig)
      .mockResolvedValueOnce(defaultConfig);
    const openaiInstance = new OpenAI();
    mocks.create.mockResolvedValueOnce([]);

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: 'Hello' },
    ];
    const options = {
      messages,
      options: {} as RunOptions,
      useAssistant: false,
    };
    await getCompletion(options);

    expect(openaiInstance.chat.completions.create).toHaveBeenCalledWith({
      model: 'gpt-4o',
      messages,
      stream: true,
    });
  });

  it('should write to stdout and stderr', async () => {
    mocks.getConfig
      .mockResolvedValueOnce(defaultConfig)
      .mockResolvedValueOnce(defaultConfig);
    const openaiInstance = new OpenAI();
    mocks.create.mockResolvedValueOnce([
      { choices: [{ delta: { content: 'Hello' } }] },
      { choices: [{ delta: { content: 'World' } }] },
    ]);
    const stdOutWriteMock = vi.spyOn(process.stdout, 'write');
    const stdErrWriteMock = vi.spyOn(process.stderr, 'write');

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: 'Hello' },
    ];
    const options = {
      messages,
      options: {} as RunOptions,
      useAssistant: false,
    };
    await getCompletion(options);

    expect(stdOutWriteMock).toHaveBeenNthCalledWith(1, gray('\n│   '));
    expect(stdOutWriteMock).toHaveBeenNthCalledWith(2, '\n');
    expect(stdErrWriteMock).toHaveBeenCalledWith(gray('Hello'));
    expect(stdErrWriteMock).toHaveBeenCalledWith(gray('World'));
  });
});

describe('getFileSuggestion', () => {
  it('should return a valid file suggestion based on input', async () => {
    mocks.getConfig.mockResolvedValue({
      ...defaultConfig,
      MODEL: 'gpt-4o',
    });
    mocks.create.mockResolvedValueOnce({
      choices: [
        {
          message: {
            tool_calls: [
              { function: { arguments: '{ "filePath": "/src/add.test.ts"}' } },
            ],
          },
        },
      ],
    });
    const prompt = 'a function that adds numbers';
    const fileString = 'src/add.ts\nsrc/subtract.ts\nsrc/multiply.ts';
    const expectedResult = 'src/add.test.ts';
    const result = await getFileSuggestion(prompt, fileString);
    expect(result).to.equal(expectedResult);
  });
});
