import Anthropic from '@anthropic-ai/sdk';
import { RunOptions } from './run';
import { getConfig } from './config';
import { imageFilePathToBase64Url } from './base64';
import { findVisualFile } from './find-visual-file';

export async function visualTest(options: RunOptions) {
  const { ANTHROPIC_KEY } = await getConfig();
  const anthropic = new Anthropic({
    apiKey: ANTHROPIC_KEY,
  });

  const filename = await findVisualFile(options);
  const designUrl = await imageFilePathToBase64Url(filename!);

  await anthropic.messages.create({
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
              media_type: 'image/jpeg',
              data: '/9j/4AAQSkZJRg...',
            },
          },
          {
            type: 'text',
            text: 'here are two designs. the first is mine, which is trying to replicate the second, the original (made by my teammate). what is wrong in mine that i need to fix? please describe in detail anything wrong with the design and layout please isgnore that i am using placeholder images (gray boxes). those will be fixed later',
          },
        ],
      },
    ],
  });
}
