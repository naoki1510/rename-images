import fs from 'fs';

export async function mkdirAsync(
  dirPath: string,
  options?: fs.MakeDirectoryOptions
) {
  return new Promise<string>((resolve, reject) => {
    fs.mkdir(dirPath, options, (err) => {
      if (err) {
        reject(err);
      }
      console.log(`MKDIR: ${dirPath}`);
      resolve(dirPath);
    });
  });
}
