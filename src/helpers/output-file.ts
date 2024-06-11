import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';

export async function outputFile(
  filePath: string,
  content: string
): Promise<void> {
  const dir = dirname(filePath);

  await mkdir(dir, { recursive: true });
  await writeFile(filePath, content);
}
