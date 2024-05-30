import Anthropic from '@anthropic-ai/sdk';
import { RunOptions } from './run';
import { getConfig } from './config';
import { bufferToBase64Url, imageFilePathToBase64Url } from './base64';
import { findVisualFile } from './find-visual-file';
import { getScreenshot } from './get-screenshot';
import { formatMessage } from './test';
import dedent from 'dedent';

export async function visualTest(options: RunOptions) {
  const { ANTHROPIC_KEY } = await getConfig();
  const anthropic = new Anthropic({
    apiKey: ANTHROPIC_KEY,
  });

  const filename = await findVisualFile(options);
  const designUrl = await imageFilePathToBase64Url(filename!);
  const screenshotUrl = bufferToBase64Url(await getScreenshot(options));

  const output = await new Promise<string>((resolve, reject) => {
    let responseText = '';
    process.stdout.write(formatMessage('\n'));
    anthropic.messages
      .stream({
        model: 'claude-3-opus-20240229',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: screenshotUrl.split(',')[1],
                },
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: designUrl.split(',')[1],
                },
              },
              {
                type: 'text',
                text: dedent`
                  here are two designs. the first is mine, which is trying to replicate the second, the original design (made by my teammate). what is wrong in mine that i need to fix? please describe in detail anything wrong with the design and layout please isgnore that i am using placeholder images (gray boxes). those will be fixed later
                
                  by detailed. point out anything that is wrongly missing or added, elements in the wrong locations, or anything that is not aligned properly. please be as detailed as possible. thank you!
                `,
              },
            ],
          },
        ],
      })
      .on('text', (text) => {
        responseText += text;
        process.stderr.write(formatMessage(text));
      })
      .on('end', () => {
        process.stdout.write('\n');
        resolve(responseText);
      })
      .on('error', (error) => {
        reject(error);
      });
  });

  return output;
}
