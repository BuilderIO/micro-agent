import { readFile } from 'fs/promises';

export async function getDependenciesFileContent(
  language?: string
): Promise<string> {
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

  const fileContent = await readFile(fileName, 'utf8');
  return fileContent;
}
