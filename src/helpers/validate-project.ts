import { getDependencyFile } from './dependency-files';

export async function isValidProject(): Promise<boolean> {
  const fileContent = await getDependencyFile();
  return fileContent !== null;
}
