import fs from 'fs';

export async function readFileAsync(filePath: string) {
  return new Promise<Buffer>((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      }
      console.log(`READ: ${filePath}`);
      resolve(data);
    });
  });
}
