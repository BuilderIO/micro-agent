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
  const { MODEL: model } = await getConfig();
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

  return output;
};

export const getCompletion = async function (options: {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  options: RunOptions;
  useAssistant?: boolean;
}) {
  const { MODEL: model } = await getConfig();
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
          resolve(removeBackticks(result));
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
    return output;
  }
};
