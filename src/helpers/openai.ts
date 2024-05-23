import OpenAI from 'openai';
import { getConfig } from './config';

const openaiKeyEnvVarName = 'OPENAI_KEY';
const defaultModel = 'gpt-4o';

export const getOpenAi = async function () {
  const { OPENAI_KEY: openaiKey } = await getConfig();
  if (!openaiKey) {
    throw new Error(`Missing environment variable: ${openaiKeyEnvVarName}`);
  }
  const openai = new OpenAI({
    apiKey: openaiKey,
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
