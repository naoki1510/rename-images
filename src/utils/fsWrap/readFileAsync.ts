import fs from 'fs';

export function readFileAsync(filePath: string, options?: { encoding?: BufferEncoding; flag?: string }) : Promise<string>;
export function readFileAsync(filePath: string, options?: { encoding?: null; flag?: string }) : Promise<Buffer>;

export async function readFileAsync(filePath: string, options?: { encoding?: BufferEncoding | null; flag?: string }) {
  return new Promise<Buffer | string>((resolve, reject) => {
    fs.readFile(filePath, options, (err, data) => {
      if (err) {
        reject(err);
      }
      console.log(`READ: ${filePath}`);
      resolve(data);
    });
  });
}
