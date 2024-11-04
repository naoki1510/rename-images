import fs from "fs";

export async function move(origin: string, target: string) {
  return new Promise<{
    origin: string;
    target: string;
  }>((resolve, reject) => {
    console.log(`MOVING: ${origin} -> ${target}`);
    fs.rename(origin, target, (err) => {
      if (err) {
        fs.copyFile(origin, target, (err) => {
          if (err) {
            reject(err);
          }
          fs.rmSync(origin);
          console.log(`MOVED: ${origin} -> ${target}`);
          resolve({ origin, target });
        });
      } else {
        console.log(`MOVED: ${origin} -> ${target}`);
        resolve({ origin, target });
      }
    });
  });
}
