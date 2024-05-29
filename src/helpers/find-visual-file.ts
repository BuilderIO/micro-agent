import { RunOptions } from './run';
import { glob } from 'glob';

const fileCache = new Map<string, string>();

export async function findVisualFile(options: RunOptions) {
  const filename = options.outputFile;
  if (fileCache.has(filename)) {
    return fileCache.get(filename);
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const fileExtension = filename.split('.').pop()!;
  const fileNameWithoutExtension = filename.replace(
    new RegExp('\\.' + fileExtension + '$'),
    ''
  );
  const imageFiles = await glob(
    `${fileNameWithoutExtension}.{png,jpg,jpeg,svg,webp}`
  );

  const imageFile = imageFiles[0];
  fileCache.set(filename, imageFile);
  return imageFile;
}
