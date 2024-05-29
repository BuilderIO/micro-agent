import dedent from 'dedent';
import { findVisualFile } from './find-visual-file';
import { getCompletion } from './openai';
import { RunOptions } from './run';
import { readFile, writeFile } from 'fs/promises';
import { success, fail } from './test';
import { getScreenshot } from './get-screenshot';
import { KnownError } from './error';

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

  const userPrompt = dedent`
    Here is a screenshot of my design. Please update my code to identically match the screenshot from the design.

    Ignore placeholder images, those are intentional when present.

    I uploaded a second file that is a screenshot of what my code looks like when rendered. Please use this to help you update the code to 
    accurately match the design - by looking at what hte code rendered, and fixing it to match the design.

    Write out your thoughts on where the current code (via the screenshot of it) is not matching the design, and then generate new
    code matching the design and addressing those issues.

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
  `;

  const designUrl = await imageFilePathToBase64Url(filename);
  await writeFile('design-image-url.txt', designUrl, 'utf-8');

  const screenshotUrl = bufferToBase64Url(await getScreenshot(options));
  await writeFile('screenshot-image-url.txt', screenshotUrl, 'utf-8');

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
              url: designUrl,
            },
          },

          {
            type: 'image_url',
            image_url: {
              url: screenshotUrl,
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
    return { code: output, testResult: fail('Code does not yet match design') };
  }
}
