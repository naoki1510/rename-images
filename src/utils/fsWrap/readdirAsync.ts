import fs from 'fs';

export async function readdirAsync(dirPath: string) {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        reject(err);
      }
      console.log(`READDIR: ${dirPath}`);
      resolve(files);
    });
  });
}
