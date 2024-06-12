import fs from 'fs/promises';
import path from 'path';

export async function isCorrectProject(): Promise<boolean> {
  const currentDir = process.cwd();
  const packageJsonPath = path.join(currentDir, 'package.json');
  const requirementsTxtPath = path.join(currentDir, 'requirements.txt');

  try {
    await fs.access(packageJsonPath);
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
