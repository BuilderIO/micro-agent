import OpenAI from 'openai';
import { getConfig } from './config';
import { KnownError } from './error';
import { commandName } from './constants';
import { systemPrompt } from './systemPrompt';
import { RunCreateParams } from 'openai/resources/beta/threads/runs/runs';
import { RunOptions } from './run';
import { log } from '@clack/prompts';
import { green } from 'kolorist';
import { formatMessage } from './test';
import { removeBackticks } from './remove-backticks';
import ollama from 'ollama';
import { readFile, writeFile } from 'fs/promises';

const defaultModel = 'gpt-4o';
export const USE_ASSISTANT = true;
const assistantIdentifierMetadataKey = '_id';
const assistantIdentifierMetadataValue = '@builder.io/micro-agent';

const useOllama = (model?: string) => {
  return model?.includes('llama') || model?.includes('phi');
};

export const getOpenAi = async function () {
  const { OPENAI_KEY: openaiKey, OPENAI_API_ENDPOINT: endpoint } =
    await getConfig();
  if (!openaiKey) {
    throw new KnownError(
      `Missing OpenAI key. Use \`${commandName} config\` to set it.`
    );
  }
  const openai = new OpenAI({
    apiKey: openaiKey,
    baseURL: endpoint,
  });
  return openai;
};

export const getSimpleCompletion = async function (options: {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  onChunk?: (chunk: string) => void;
}) {
  const {
    MODEL: model,
    MOCK_LLM_RECORD_FILE: mockLlmRecordFile,
    USE_MOCK_LLM: useMockLlm,
  } = await getConfig();

  if (useMockLlm) {
    return mockedLlmCompletion(mockLlmRecordFile, options.messages);
  }

  if (useOllama(model)) {
    const response = await ollama.chat({
      model: model,
      messages: options.messages as any[],
      stream: true,
    });

    let output = '';

    for await (const chunk of response) {
      output += chunk.message.content;
      if (options.onChunk) {
        options.onChunk(chunk.message.content);
      }
    }
    captureLlmRecord(options.messages, output, mockLlmRecordFile);

    return output;
  }
  const openai = await getOpenAi();
  const completion = await openai.chat.completions.create({
    model: model || defaultModel,
    messages: options.messages,
    stream: true,
  });

  let output = '';

  for await (const chunk of completion) {
    const str = chunk.choices[0]?.delta.content;
    if (str) {
      output += str;
      if (options.onChunk) {
        options.onChunk(str);
      }
    }
  }

  captureLlmRecord(options.messages, output, mockLlmRecordFile);

  return output;
};

export const getCompletion = async function (options: {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  options: RunOptions;
  useAssistant?: boolean;
}) {
  const {
    MODEL: model,
    MOCK_LLM_RECORD_FILE: mockLlmRecordFile,
    USE_MOCK_LLM: useMockLlm,
  } = await getConfig();
  if (useMockLlm) {
    return mockedLlmCompletion(mockLlmRecordFile, options.messages);
  }

  const useModel = model || defaultModel;
  const useOllamaChat = useOllama(useModel);

  if (useOllamaChat) {
    const completion = await ollama.chat({
      model: model || defaultModel,
      messages: options.messages as any[],
      stream: true,
    });
    let output = '';
    process.stdout.write(formatMessage('\n'));
    for await (const chunk of completion) {
      const str = chunk.message.content;
      if (str) {
        output += str;
        process.stderr.write(formatMessage(str));
      }
    }
    process.stdout.write('\n');

    captureLlmRecord(options.messages, output, mockLlmRecordFile);
    return output;
  }
  const openai = await getOpenAi();

  if (options.useAssistant ?? USE_ASSISTANT) {
    let assistantId: string;
    const assistants = await openai.beta.assistants.list({
      limit: 100,
    });
    const assistant = assistants.data.find(
      (assistant) =>
        (assistant.metadata as any)?.[assistantIdentifierMetadataKey] ===
        assistantIdentifierMetadataValue
    );
    if (assistant) {
      assistantId = assistant.id;
    } else {
      const assistant = await openai.beta.assistants.create({
        name: 'Micro Agent',
        model: useModel,
        metadata: {
          [assistantIdentifierMetadataKey]: assistantIdentifierMetadataValue,
        },
      });
      assistantId = assistant.id;
    }
    let threadId = options.options.threadId;
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      log.info(`Created thread: ${green(threadId)}`);
    }
    options.options.threadId = threadId;

    process.stdout.write(formatMessage('\n'));

    let result = '';
    return new Promise<string>((resolve) => {
      openai.beta.threads.runs
        .stream(threadId, {
          instructions: systemPrompt,
          assistant_id: assistantId,
          additional_messages: options.messages.filter(
            (message) => message.role !== 'system'
          ) as RunCreateParams.AdditionalMessage[],
        })
        .on('textDelta', (textDelta) => {
          const str = textDelta.value || '';
          if (str) {
            result += textDelta.value;
            process.stderr.write(formatMessage(str));
          }
        })
        .on('textDone', () => {
          process.stdout.write('\n');
          let output = removeBackticks(result);
          captureLlmRecord(options.messages, output, mockLlmRecordFile);
          resolve(output);
        });
    });
  } else {
    const completion = await openai.chat.completions.create({
      model: model || defaultModel,
      messages: options.messages,
      stream: true,
    });
    let output = '';
    process.stdout.write(formatMessage('\n'));
    for await (const chunk of completion) {
      const str = chunk.choices[0]?.delta.content;
      if (str) {
        output += str;
        process.stderr.write(formatMessage(str));
      }
    }
    process.stdout.write('\n');
    captureLlmRecord(options.messages, output, mockLlmRecordFile);

    return output;
  }
};

const captureLlmRecord = async (
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  output: string,
  mockLlmRecordFile?: string
) => {
  if (mockLlmRecordFile) {
    const mockLlmRecordFileContents = await readFile(
      mockLlmRecordFile,
      'utf-8'
    ).catch(() => '');
    let jsonLlmRecording;
    try {
      jsonLlmRecording = JSON.parse(mockLlmRecordFileContents.toString());
    } catch {
      jsonLlmRecording = { completions: [] };
    }
    jsonLlmRecording.completions.push({
      inputs: messages,
      output: output,
    });

    await writeFile(
      mockLlmRecordFile,
      JSON.stringify(jsonLlmRecording, null, 2)
    );
  }
};
const mockedLlmCompletion = async (
  mockLlmRecordFile: string | undefined,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
) => {
  if (!mockLlmRecordFile) {
    throw new KnownError(
      'You need to set the MOCK_LLM_RECORD_FILE environment variable to use the mock LLM'
    );
  }
  const mockLlmRecordFileContents = await readFile(mockLlmRecordFile, 'utf-8').catch(
    () => ''
  );
  let jsonLlmRecording;
  try {
    jsonLlmRecording = JSON.parse(mockLlmRecordFileContents.toString());
  } catch {
    throw new KnownError(
      'The MOCK_LLM_RECORD_FILE file is not a valid JSON file'
    );
  }
  const completion = jsonLlmRecording.completions.find((completion: { inputs: any; }) => {
    // Match on system input only
    return JSON.stringify(completion.inputs[0]) === JSON.stringify(messages[0]);
  });
  if (!completion) {
    throw new KnownError(
      `No completion found for the given system input in the MOCK_LLM_RECORD_FILE: ${JSON.stringify(messages[0])}`
    );
  }
  process.stdout.write(formatMessage('\n'));
  process.stderr.write(formatMessage(completion.output));
  return completion.output;
}
