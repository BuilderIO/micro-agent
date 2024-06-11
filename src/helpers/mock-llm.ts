import { readFile, writeFile } from 'fs/promises';
import { KnownError } from './error';
import { formatMessage } from './test';
import OpenAI from 'openai';

const readMockLlmRecordFile = async (
  mockLlmRecordFile: string
): Promise<{ completions: any[] }> => {
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
  return jsonLlmRecording;
};

export const captureLlmRecord = async (
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  output: string,
  mockLlmRecordFile?: string
) => {
  if (mockLlmRecordFile) {
    const jsonLlmRecording = await readMockLlmRecordFile(mockLlmRecordFile);

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
export const mockedLlmCompletion = async (
  mockLlmRecordFile: string | undefined,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
) => {
  if (!mockLlmRecordFile) {
    throw new KnownError(
      'You need to set the MOCK_LLM_RECORD_FILE environment variable to use the mock LLM'
    );
  }
  const jsonLlmRecording = await readMockLlmRecordFile(mockLlmRecordFile);
  const completion = jsonLlmRecording.completions.find(
    (completion: { inputs: any }) => {
      // Match on system input only
      const content = completion.inputs[0].content;
      if (typeof messages[0].content === 'string') {
        return messages[0].content.includes(content);
      }
      return (
        JSON.stringify(completion.inputs[0]) ===
        JSON.stringify(messages[0].content)
      );
    }
  );
  if (!completion) {
    throw new KnownError(
      `No completion found for the given system input in the MOCK_LLM_RECORD_FILE: ${JSON.stringify(
        messages[0]
      )}`
    );
  }
  process.stdout.write(formatMessage('\n'));
  process.stderr.write(formatMessage(completion.output));
  return completion.output;
};
