import { findVisualFile } from './find-visual-file';
import { RunOptions } from './run';
import { chromium } from 'playwright';
import probe from 'probe-image-size';
import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';

const cacheByCode = new Map<string, Buffer>();

// Use Playwright to get a screenshot of the given url
export async function getScreenshot(options: RunOptions) {
  const currentCode = await readFile(options.outputFile, 'utf-8');
  const cached = cacheByCode.get(currentCode);
  if (cached) {
    return cached;
  }

  const url = options.visual;
  const imageFile = await findVisualFile(options);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { width, height } = await probe(createReadStream(imageFile!));

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width, height });
  await page.goto(url);
  const screenshot = await page.screenshot({ type: 'png' });
  await browser.close();
  cacheByCode.set(currentCode, screenshot);
  return screenshot;
}
