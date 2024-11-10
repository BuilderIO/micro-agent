import Anthropic from '@anthropic-ai/sdk';
import { RunOptions } from './run';
import { getConfig } from './config';
import { bufferToBase64Url, imageFilePathToBase64Url } from './base64';
import { findVisualFile } from './find-visual-file';
import { getScreenshot } from './get-screenshot';
import { formatMessage } from './test';
import dedent from 'dedent';
import { outputFile } from './output-file';

// use sharp to combine two images, putting them side by side
const combineTwoImages = async (image1: string, image2: string) => {
  const { default: sharp } = await import('sharp');
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

  return (
    combinedImage
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
      // .composite([
      //   {
      //     input: await readFile('src/images/original-label.png'),
      //     gravity: 'northwest',
      //   },
      //   {
      //     input: await readFile('src/images/my-version-label.png'),
      //     gravity: 'northeast',
      //   },
      // ])
      .png()
      .toBuffer()
  );
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
    await combineTwoImages(designUrl, screenshotUrl)
  );

  const debugImageOutputFolder = 'debug/images';

  await outputFile(
    `${debugImageOutputFolder}/composite-image-url.txt`,
    composite
  );

  const output = await new Promise<string>((resolve, reject) => {
    let responseText = '';
    process.stdout.write(formatMessage('\n'));
    anthropic.messages
      .stream({
        model: 'claude-3-5-sonnet-20241022',
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
                  here is a screenshot of some original code (left side of image) and my code trying to replicate it (right side of image)
                  what did I get wrong? be incredibly specific, like which objects are missing or placed in the wrong places and where exactly they should be placed instead
                  make it so that i could simply read what you say and update the code without any other visual and get it right. don't give me code, just words

                  focus primarily on major layout differences. for instance, are all buttons, columns, etc in the right place? if not, be very precise about what should move exactly
                  where. then, if the layout is perfect, focus on styling
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
