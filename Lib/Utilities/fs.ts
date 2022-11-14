import fs from 'fs';

export const removeFolder = (location: string) => {
  try {
    fs.rmSync(location, { recursive: true, force: true });
  } catch (err) {
    console.error('Remove folder error: ', err);
  }
};

export const createFolder = (path: string) => {
  console.log('creating folder: ', path);
  try {
    fs.mkdirSync(path);
  } catch (err) {
    console.error('Folder creation error: ', err);
  }
};

export const writeFile = (path: string, content: string, extension = 'ts'): void => {
  console.log('writing file: ', path);
  try {
    fs.writeFileSync(`${path}.${extension}`, content);
  } catch (err) {
    console.error('File creation error: ', err);
  }
};
