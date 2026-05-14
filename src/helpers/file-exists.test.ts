import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { fileExists } from './file-exists';

const tmpDir = join(import.meta.dirname, '__file-exists-fixture__');

describe('fileExists', () => {
  beforeAll(async () => {
    await mkdir(tmpDir, { recursive: true });
  });

  afterAll(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('returns true for an existing file', async () => {
    const filePath = join(tmpDir, 'exists.txt');
    await writeFile(filePath, 'hello');
    await expect(fileExists(filePath)).resolves.toBe(true);
  });

  it('returns false for a non-existent file', async () => {
    await expect(fileExists(join(tmpDir, 'does-not-exist.txt'))).resolves.toBe(false);
  });

  it('returns true for a directory path', async () => {
    // fs.access succeeds on directories too, so fileExists returns true
    await expect(fileExists(tmpDir)).resolves.toBe(true);
  });

  it('returns false for a non-existent nested path', async () => {
    await expect(fileExists(join(tmpDir, 'deeply', 'nested', 'path.txt'))).resolves.toBe(false);
  });
});
