import Anthropic from '@anthropic-ai/sdk';
import { RunOptions } from './run';
import { getConfig } from './config';
import { bufferToBase64Url, imageFilePathToBase64Url } from './base64';
import { findVisualFile } from './find-visual-file';
import { getScreenshot } from './get-screenshot';
import { formatMessage } from './test';
import dedent from 'dedent';
import sharp from 'sharp';

// use sharp to combine two images, putting them side by side
const combineTwoImages = async (image1: string, image2: string) => {
  const image1Buffer = Buffer.from(image1.split(',')[1], 'base64');
  const image2Buffer = Buffer.from(image2.split(',')[1], 'base64');

  const image1Sharp = sharp(image1Buffer);
  const image2Sharp = sharp(image2Buffer);

  const image1Metadata = await image1Sharp.metadata();
  const image2Metadata = await image2Sharp.metadata();

  const width = image1Metadata.width! + image2Metadata.width!;
  const height = Math.max(image1Metadata.height!, image2Metadata.height!);

  const combinedImage = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  });

  return combinedImage
    .composite([
      {
        input: image1Buffer,
        top: 0,
        left: 0,
      },
      {
        input: image2Buffer,
        top: 0,
        left: image1Metadata.width,
      },
    ])
    .png()
    .toBuffer();
};

export async function visualTest(options: RunOptions) {
  const { ANTHROPIC_KEY } = await getConfig();
  const anthropic = new Anthropic({
    apiKey: ANTHROPIC_KEY,
  });

  const filename = await findVisualFile(options);
  const designUrl = await imageFilePathToBase64Url(filename!);
  const screenshotUrl = bufferToBase64Url(await getScreenshot(options));

  const composite = bufferToBase64Url(
    await combineTwoImages(screenshotUrl, designUrl)
  );

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
                  data: composite.split(',')[1],
                },
              },

              {
                type: 'text',
                text: dedent`
                  here are two designs in one image. the left side is mine, which is trying to replicate the original design (right side). what is wrong in mine that i need to fix? please describe in detail anything wrong with the design and layout please isgnore that i am using placeholder images (gray boxes). those will be fixed later
                
                  by detailed. point out anything that is wrongly missing or added, elements in the wrong locations, or anything that is not aligned properly. please be as detailed as possible. 

                  be very specific. never say "update the button to better match the design". say exactly what must change, like "move the button 20px to the right" or "change the button color to #FF0000" or "change the heading font to Helvetica" or "the main button should be below the heading, not to the left of it", etc. don't use those exactly, they are just examples.
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
