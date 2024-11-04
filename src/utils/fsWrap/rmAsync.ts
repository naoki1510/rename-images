import fs from 'fs';

export async function rmAsync(filePath: string, options?: fs.RmOptions) {
  return new Promise<string>((resolve, reject) => {
    fs.rm(filePath, options || {}, (err) => {
      if (err) {
        reject(err);
      }
      console.log(`REMOVE: ${filePath}`);
      resolve(filePath);
    });
  });
}
