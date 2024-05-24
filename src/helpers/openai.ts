import OpenAI from 'openai';
import { getConfig } from './config';
import { KnownError } from './error';
import { commandName } from './constants';

const defaultModel = 'gpt-4o';

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

export const getCompletion = async function (options: {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
}) {
  const { MODEL: model } = await getConfig();
  const openai = await getOpenAi();
  const completion = await openai.chat.completions.create({
    model: model || defaultModel,
    messages: options.messages,
  });
  return completion.choices[0].message.content;
};
