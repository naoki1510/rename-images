import fs from 'fs';
import { MODE } from '../../constants.js';

export type MoveResult = {
  origin: string;
  target: string;
  status: 'RENAMED' | 'MOVED' | 'SKIPPED' | 'COPIED';
};

export async function moveAsync(origin: string, target: string) {
  target = target.replaceAll(/\/+/g, '/');

  const dir = target.replace(/\/[^/]*$/, '');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new Promise<MoveResult>((resolve, reject) => {
    try {
      if (origin === target) {
        console.log(`SKIP: ${origin} -> ${target} (SAME PATH)`);
        resolve({ origin, target, status: 'SKIPPED' });
      }
      const copy = (origin: string, target: string, remove = false) => {
        fs.copyFile(origin, target, (err) => {
          if (err) {
            reject(err);
            return;
          }
          console.log(`  COPY: ${origin} -> ${target}`);
          if (remove) {
            fs.rm(origin, (err) => {
              if (err) {
                reject(err);
                return;
              }
              console.log(`  REMOVE: ${origin}`);
              resolve({ origin, target, status: 'MOVED' });
            });
          } else {
            resolve({ origin, target, status: 'COPIED' });
          }
        });
      };
      console.log(`MOVE: ${origin} -> ${target}`);
      if (MODE === 'move') {
        fs.rename(origin, target, (err) => {
          if (err) {
            copy(origin, target);
          } else {
            console.log(`  RENAME: ${origin} -> ${target}`);
            resolve({ origin, target, status: 'RENAMED' });
          }
        });
      } else if (MODE === 'copy') {
        copy(origin, target);
      } else {
        resolve({ origin, target, status: 'SKIPPED' });
      }
    } catch (e) {
      reject(e as Error);
    }
  });
}
