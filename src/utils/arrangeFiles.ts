import fs from 'fs';

import {
  DELETING_FILE_REGEX,
  IGNORABLE_FILE_REGEX,
  IMAGE_FILE_REGEX,
  IS_DEBUG_MODE,
  MAX_PARALLEL,
  MOVIE_FILE_REGEX,
  SKIPPING_DIR_REGEX,
  SKIPPING_FILE_REGEX,
} from '../constants.js';
import { arrangeImage } from './arrangeImage.js';
import { arrangeMovie } from './arrangeMovie.js';
import { rmAsync } from './fsWrap/rmAsync.js';
import { MoveResult } from './fsWrap/moveAsync.js';
import { readdirAsync } from './fsWrap/readdirAsync.js';

type Counter = {
  total: number;
  current: number;
  tasks: Promise<MoveResult>[];
};

const formatCount = (counter: Counter) => {
  const digits = counter.total.toString().length;
  return `[${counter.current.toString().padStart(digits, '0')}/${counter.total}]`;
};

export const failures: string[] = [];

/**
 * ファイルを整理する
 * @param path 整理するディレクトリのフルパス
 */
export const arrangeFiles = async (
  path: string,
  counter: Counter = { total: 0, current: 0, tasks: [] }
) => {
  const files = fs.readdirSync(path);

  const results = await Promise.all(
    files.map(async (file): Promise<MoveResult[]> => {
      const fullPath = `${path}/${file}`;
      if (IS_DEBUG_MODE) {
        console.log(`CHECKING ${path}, ${file}`);
      }

      try {
        // 削除
        if (DELETING_FILE_REGEX.test(file)) {
          await rmAsync(fullPath);
          if (IS_DEBUG_MODE) {
            console.log(`REMOVED ${fullPath} BECAUSE IT'S MARKED AS DELETING`);
          }
          return [];
        }

        // スキップ対象
        if (
          SKIPPING_FILE_REGEX.test(file) ||
          SKIPPING_DIR_REGEX.test(fullPath)
        ) {
          if (IS_DEBUG_MODE) {
            console.log(`SKIPPING ${fullPath} BECAUSE IT'S MARKED AS SKIPPING`);
          }
          return [];
        }

        // ディレクトリの場合は再帰的に処理
        const isDirectory = fs.lstatSync(fullPath).isDirectory();
        if (isDirectory) {
          if (IS_DEBUG_MODE) {
            console.log(`RECURSING "${fullPath}"`);
          }
          const arrangedFiles = await arrangeFiles(fullPath, counter);
          if (arrangedFiles.length === 0) {
            return [];
          }
          // フォルダ内のファイルが全て移動された場合はフォルダを削除
          const restFiles = await readdirAsync(fullPath).then((files) =>
            files.filter((file) => !IGNORABLE_FILE_REGEX.test(file))
          );
          if (restFiles.length === 0) {
            await rmAsync(fullPath, { recursive: true, force: true });
            if (IS_DEBUG_MODE) {
              console.log(`REMOVED "${fullPath}" BECAUSE IT'S EMPTY`);
            }
          }

          return arrangedFiles;
        }

        const createTask = async (
          moveFile: (path: string, file: string) => Promise<MoveResult>
        ) => {
          counter.total++;

          await Promise.resolve();
          while (counter.tasks.length >= MAX_PARALLEL) {
            await Promise.race(counter.tasks);
          }
          counter.current++;
          console.log(`${formatCount(counter)} ${fullPath}`);
          const task = moveFile(path, file);
          counter.tasks.push(task);

          const result = await task;
          counter.tasks = counter.tasks.filter((t) => t !== task);

          return [result];
        };

        // 画像パターンにマッチする場合は整理
        if (IMAGE_FILE_REGEX.test(file)) {
          return createTask(arrangeImage);
        }

        // 動画パターンにマッチする場合は整理
        if (MOVIE_FILE_REGEX.test(file)) {
          return createTask(arrangeMovie);
        }

        // それ以外のファイルはスキップ
        if (IS_DEBUG_MODE) {
          console.log(`SKIPPING "${fullPath}" BECAUSE IT'S NOT MATCHED`);
        }
        return [];
      } catch (e) {
        console.error(`FAILED TO ARRANGE "${fullPath}"`);
        console.error(e);
        failures.push(fullPath);
        // throw e;
      }

      return [];
    })
  );

  return results.flat();
};
