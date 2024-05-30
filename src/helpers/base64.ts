import { readFile } from 'fs/promises';

export const imageFilePathToBase64Url = async (imageFilePath: string) => {
  const image = await readFile(imageFilePath);
  const extension = imageFilePath.split('.').pop();
  const imageBase64 = Buffer.from(image).toString('base64');
  return `data:image/${
    extension === 'jpg' ? 'jpeg' : extension
  };base64,${imageBase64}`;
};

export const bufferToBase64Url = (buffer: Buffer) => {
  const imageBase64 = buffer.toString('base64');
  return `data:image/png;base64,${imageBase64}`;
};
