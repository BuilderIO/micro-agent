import { readFile } from 'fs/promises';
import * as path from 'path';
import { fileExists } from './file-exists';

/**
 * Find dependency file in the given directory or any
 * parent directory. Returns the content of the dependency file.
 */
export async function getDependencyFile(
  directory = process.cwd(),
  language?: string
): Promise<string | null> {
  let currentDirectory = directory;
  const rootDirectory = path.parse(directory).root;
  while (currentDirectory !== rootDirectory || rootDirectory == '') {
    if (language) {
      const filePath = getDependenciesFilePath(directory, language);

      if (await fileExists(filePath)) {
        return getDependenciesFileContent(directory, language);
      }
    } else {
      let filePath = getDependenciesFilePath(directory, 'py');
      if (await fileExists(filePath)) {
        return getDependenciesFileContent(directory, 'py');
      }
      filePath = getDependenciesFilePath(directory, 'rb');
      if (await fileExists(filePath)) {
        return getDependenciesFileContent(directory, 'rb');
      }
      filePath = getDependenciesFilePath(directory, 'js');
      if (await fileExists(filePath)) {
        return getDependenciesFileContent(directory, 'js');
      }
    }
    currentDirectory = path.dirname(currentDirectory);
  }
  return null;
}

export function getDependencyFileName(language?: string): string {
  let fileName;
  switch (language) {
    case 'py':
      fileName = 'requirements.txt';
      break;
    case 'rb':
      fileName = 'Gemfile';
      break;
    default:
      fileName = 'package.json';
      break;
  }
  return fileName;
}

function getDependenciesFilePath(directory: string, language?: string): string {
  const fileName = getDependencyFileName(language);
  return path.join(directory, fileName);
}

async function getDependenciesFileContent(
  directory = process.cwd(),
  language?: string
): Promise<string> {
  const filePath = getDependenciesFilePath(directory, language);
  const fileContent = await readFile(filePath, 'utf8');
  return fileContent;
}
