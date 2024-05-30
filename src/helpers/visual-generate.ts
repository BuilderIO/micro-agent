import dedent from 'dedent';
import { findVisualFile } from './find-visual-file';
import { getCompletion } from './openai';
import { RunOptions } from './run';
import { readFile, writeFile } from 'fs/promises';
import { success, fail } from './test';
import { getScreenshot } from './get-screenshot';
import { KnownError } from './error';
import sharp from 'sharp';
import { applyUnifiedDiff } from './apply-unified-diff';
import { removeBackticks } from './remove-backticks';

const imageFilePathToBase64Url = async (imageFilePath: string) => {
  const image = await readFile(imageFilePath);
  const extension = imageFilePath.split('.').pop();
  const imageBase64 = Buffer.from(image).toString('base64');
  return `data:image/${
    extension === 'jpg' ? 'jpeg' : extension
  };base64,${imageBase64}`;
};

const bufferToBase64Url = (buffer: Buffer) => {
  const imageBase64 = buffer.toString('base64');
  return `data:image/png;base64,${imageBase64}`;
};

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

export const systemPrompt =
  "You take a prompt and generate code accordingly. Use placeholders (e.g. https://placehold.co/600x400) for any new images that weren't in the code previously. Don't make up image paths, always use placeholers from placehold.co";

export async function visualGenerate(options: RunOptions) {
  const filename = await findVisualFile(options);
  if (!filename) {
    throw new KnownError(
      dedent`No image file found. Please specify a file, or put one next to the file you are editing like:
      
      ./editing-file.ts
      ./editing-file.png # <- image file we'll use
      `
    );
  }

  const prompt = await readFile(options.promptFile, 'utf-8').catch(() => '');
  const priorCode = await readFile(options.outputFile, 'utf-8').catch(() => '');

  const asDiff = true;

  const userPrompt = dedent`
    Here is an image split in half - the left half is my original design, and the right half is what my code currently renders.
    
    Please update my code to identically match the original design (left side of the image I uploaded).

    Ignore placeholder images, those are intentional when present.

    Write out your thoughts on where the current code (via the screenshot of it) is not matching the design (be specific), and how exactly the code needs
    to be updated to be fixed and then generate new code matching the design and addressing those issues.

    For instance, if the header is left aligned but should be centet aligned, you would write:
    "The header is left aligned, but should be center aligned." (don't write that exactly, its just an example. also leave out the quotes)

    Especially focus on major layout issues. If something should be 3 columns but is 2, or if something is supposed to be left aligned vs centered, 
    write it out and fix it. Every small detail matters, be extremely precise and detailed.

    Don't summarize your changes at the end, just write out what needs changing, then give me the code, and nothing else.

    Heres some additional instructions:
    <prompt>
    ${prompt || 'Make them look as close as possible'}
    </prompt>

    The current code is:
    <code>
    ${priorCode || 'None'}
    </code>

    The file path for the above is ${options.outputFile}.

    Please EITHER give me new code that better matches the design, or if the code is 99% accurate to the design,
    just output "looks good" and nothing else.

    ${
      !asDiff
        ? ''
        : dedent`
        Give me the code as a unified diff from the current code, not the entire file.
      `
    }
  `;

  const designUrl = await imageFilePathToBase64Url(filename);
  await writeFile('design-image-url.txt', designUrl, 'utf-8');

  const screenshotUrl = bufferToBase64Url(await getScreenshot(options));
  await writeFile('screenshot-image-url.txt', screenshotUrl, 'utf-8');

  const combinedImage = bufferToBase64Url(
    await combineTwoImages(designUrl, screenshotUrl)
  );
  await writeFile('combined-image-url.txt', combinedImage, 'utf-8');

  const output = await getCompletion({
    useAssistant: false,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: combinedImage,
            },
          },

          { type: 'text', text: userPrompt },
        ],
      },
    ],
    options,
  });

  if (output?.toLowerCase().trim().startsWith('looks good') || !output) {
    return { code: priorCode, testResult: success() };
  } else {
    const stripped = removeBackticks(output);
    console.log('stripped', stripped);
    if (asDiff) {
      const newCode = applyUnifiedDiff(stripped, priorCode);
      return {
        code: newCode,
        testResult: fail('Code does not yet match design'),
      };
    } else {
      return {
        code: stripped,
        testResult: fail('Code does not yet match design'),
      };
    }
  }
}
