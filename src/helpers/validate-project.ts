import fs from 'fs/promises';
import path from 'path';
import { findPackageJson } from './find-package-json';

export async function isValidProject(): Promise<boolean> {
  const currentDir = process.cwd();
  const requirementsTxtPath = path.join(currentDir, 'requirements.txt');

  try {
    await findPackageJson();
    return true;
  } catch {
    // Do nothing if file doesn't exist
  }

  try {
    await fs.access(requirementsTxtPath);
    return true;
  } catch {
    // Do nothing if file doesn't exist
  }

  return false;
}
