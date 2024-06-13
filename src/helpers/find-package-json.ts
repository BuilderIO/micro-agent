import * as fs from 'fs/promises';
import * as path from 'path';
import { fileExists } from './file-exists';

/**
 * Find package.json file in the given directory or any
 * parent directory.
 */
export async function findPackageJson(
  directory = process.cwd()
): Promise<string | null> {
  let currentDirectory = directory;
  while (currentDirectory !== '/') {
    const packageJsonPath = path.join(currentDirectory, 'package.json');
    if (await fileExists(packageJsonPath)) {
      return fs.readFile(packageJsonPath, 'utf-8');
    }
    currentDirectory = path.dirname(currentDirectory);
  }
  return null;
}
