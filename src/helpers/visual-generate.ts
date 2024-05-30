import dedent from 'dedent';
import { findVisualFile } from './find-visual-file';
import { getCompletion } from './openai';
import { RunOptions } from './run';
import { readFile, writeFile, mkdir, stat } from 'fs/promises';
import { success, fail, formatMessage } from './test';
import { getScreenshot } from './get-screenshot';
import { KnownError } from './error';
import { applyUnifiedDiff } from './apply-unified-diff';
import { removeBackticks } from './remove-backticks';
import { bufferToBase64Url, imageFilePathToBase64Url } from './base64';
import Anthropic from '@anthropic-ai/sdk';
import { getConfig } from './config';
import { visualTest } from './visual-test';

const USE_ANTHROPIC = false;
const USE_VISUAL_TEST = true as boolean;

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

  const visualTestResult = USE_VISUAL_TEST && (await visualTest(options));
  if (
    visualTestResult &&
    visualTestResult.toLowerCase().trim().startsWith('looks good')
  ) {
    return { code: priorCode, testResult: success() };
  }

  const asDiff = false;
  const asJsonDiff = false;

  const userPrompt = dedent`
    The first image is a design i'm trying to 100% match. the second image the render of my current code. 
  
    Please update my code to identically match the original design (left side of the image I uploaded).

    Think out loud - list exactly what is different between the original and mine that needs to be fixed before
    you start coding, such as layout and styling issues or missing elements. 

    Ignore placeholder images (gray boxes), those are intentional when present and will be fixed later.

    Heres some important instructions to follow of what specifically needs fixing:
    <prompt>
    ${
      visualTestResult ||
      'Make the code match the original design as close as possible.'
    }
    </prompt>

    The current code is:
    <code>
    ${priorCode || 'None'}
    </code>

    Here are additional instructions from the user:
    <prompt>
    ${prompt || 'None provided'}
    </prmopt>

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

    ${
      !asJsonDiff
        ? ''
        : dedent`
        Give me the code as a JSON diff from the current code, not the entire file. I will split split the current file
        into lines (an array of strings where each sttring is one line) and you will need to provide the json patches to make
        the current code match the design. Then I will apply the patches you give me to the array and then combine
        the array of strings back into a single string to get the new code.
      `
    }
  `;

  const designUrl = await imageFilePathToBase64Url(filename);
  const debugImageOutputFolder = 'debug/images';
  try {
    await stat(debugImageOutputFolder);
  } catch (error) {
    await mkdir(debugImageOutputFolder, { recursive: true });
  }
  await writeFile(
    `${debugImageOutputFolder}/design-image-url.txt`,
    designUrl,
    'utf-8'
  );

  const screenshotUrl = bufferToBase64Url(await getScreenshot(options));
  await writeFile(
    `${debugImageOutputFolder}/screenshot-image-url.txt`,
    screenshotUrl,
    'utf-8'
  );

  let output: string;
  if (USE_ANTHROPIC) {
    const { ANTHROPIC_KEY, ANTHROPIC_MODEL } = await getConfig();
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_KEY,
    });
    output = await new Promise<string>((resolve, reject) => {
      let responseText = '';

      process.stdout.write(formatMessage('\n'));
      anthropic.messages
        .stream({
          model: ANTHROPIC_MODEL || 'claude-3-opus-20240229',
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/png',
                    data: designUrl.split(',')[1],
                  },
                },
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/png',
                    data: screenshotUrl.split(',')[1],
                  },
                },
                { type: 'text', text: userPrompt },
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
  } else {
    output = await getCompletion({
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
  }

  if (output?.toLowerCase().trim().startsWith('looks good') || !output) {
    return { code: priorCode, testResult: success() };
  } else {
    const stripped = removeBackticks(output);

    if (asJsonDiff) {
      const parsed = JSON.parse(stripped);
      const priorLines = priorCode.split('\n');
      const newLines = parsed.reduce((acc: string[], patch: any) => {
        if (patch.op === 'add') {
          acc.push(patch.value);
        } else if (patch.op === 'remove') {
          acc.pop();
        } else if (patch.op === 'replace') {
          acc.pop();
          acc.push(patch.value);
        }
        return acc;
      }, priorLines);
      const newCode = newLines.join('\n');
      return {
        code: newCode,
        testResult: fail('Code does not yet match design'),
      };
    } else if (asDiff) {
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
