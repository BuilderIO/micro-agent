import { findVisualFile } from './find-visual-file';
import { RunOptions } from './run';
import { chromium, Browser, Page } from 'playwright';
import probe from 'probe-image-size';
import { createReadStream } from 'fs';

let browser: Browser;
let page: Page;

// Use Playwright to get a screenshot of the given url
export async function getScreenshot(options: RunOptions) {
  const url = options.visual;
  const imageFile = await findVisualFile(options);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { width, height } = await probe(createReadStream(imageFile!));

  if (!browser) {
    browser = await chromium.launch({
      headless: true,
    });
  }
  if (!page) {
    page = await browser.newPage();
  }

  await page.setViewportSize({ width, height });
  await page.goto(url);
  const screenshot = await page.screenshot({ type: 'png' });
  return screenshot;
}

process.on('exit', async () => {
  if (browser) {
    await browser.close();
  }
});
