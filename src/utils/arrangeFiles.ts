import fs from "fs";

import { TARGET_PATH } from "../constants";
import { arrangeImage } from "./arrangeImage";
import { arrangeMovie } from "./arrangeMovie";

const lstat = (path: string) => {
  return new Promise<fs.Stats>((resolve, reject) => {
    fs.lstat(path, (err, stats) => {
      if (err) {
        reject(err);
      }
      resolve(stats);
    });
  });
};

const readdir = (path: string) => {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        reject(err);
      }
      resolve(files);
    });
  });
};

let totalCount = 0;
const totalCountDigits = () => String(totalCount).length;
const padCount = (count: number) =>
  count.toString().padStart(totalCountDigits(), "0");

/**
 * ファイルを整理する
 * @param path 整理するディレクトリのフルパス
 */
export const arrangeFiles = async (
  path: string,
  pattern: {
    picture: RegExp;
    movie: RegExp;
  },
  options?: {
    showSkipped?: boolean;
  }
) => {
  const { showSkipped = true } = options || {};
  const files = await readdir(path);

  return files.reduce(async (completedCount, file): Promise<number> => {
    const fullPath = `${path}/${file}`;
    try {
      // 削除対象のファイル
      // if (file.match(/^(.*\.(modd|moff|xmp|json|\w* \(1\))|\._.*)$/i)) {
      //   fs.rmSync(fullPath, { recursive: true, force: true });
      //   console.log(`${fullPath} WAS DELETED BECAUSE IT'S MARKED AS DELETING`);
      //   return;
      // }

      // スキップ対象
      if (
        file.match(/^(?:@eaDir|\._.*|\.DS_Store)$/i) ||
        fullPath.match(
          new RegExp(
            `^${TARGET_PATH}/(movies|mobileBackup|unknown|\\d{4}/\\d{2}/\\d{2})`,
            "i"
          )
        )
      ) {
        showSkipped &&
          console.log(`SKIPPING ${fullPath} BECAUSE IT'S MARKED AS SKIPPING`);
        return await completedCount;
      }

      const stat = fs.lstatSync(fullPath);
      const isDirectory = stat.isDirectory();

      // ディレクトリの場合は再帰的に処理
      if (isDirectory) {
        console.log(`LOOKING INTO ${fullPath}`);
        const movedFileCount = await arrangeFiles(fullPath, pattern, options);
        const count = await completedCount;
        if (movedFileCount === 0) {
          return count;
        }
        const validFiles = fs
          .readdirSync(fullPath)
          .filter(
            (f) =>
              !f.match(
                /(?:@eaDir|\.DS_Store|\._.*|(DATABASE|STATUS)\.BIN|Thumbs.db)/i
              )
          );
        if (validFiles.length === 0) {
          fs.rmSync(fullPath, { recursive: true, force: true });
          console.log(`${fullPath} WAS DELETED BECAUSE IT'S EMPTY`);
        }
        return count + movedFileCount;
      }

      // 画像パターンにマッチする場合は整理
      if (file.match(pattern.picture)) {
        totalCount++;
        const count = await completedCount;
        console.log(
          `[${padCount(count + 1)}/${padCount(totalCount)}] ${fullPath}`
        );

        const result = arrangeImage(path, file);
        if (!result) {
          console.log(`FAILED TO ARRANGE ${fullPath}`);
          return count;
        }
        const { origin, target } = await result;
        if (origin === target) {
          return count;
        }
        return count + 1;
      }

      // 動画パターンにマッチする場合は整理
      if (file.match(pattern.movie)) {
        totalCount++;
        const count = await completedCount;
        console.log(
          `[${padCount(count + 1)}/${padCount(totalCount)}] ${fullPath}`
        );

        const result = arrangeMovie(path, file);
        if (!result) {
          console.log(`FAILED TO ARRANGE ${fullPath}`);
          return count;
        }
        const { origin, target } = await result;
        if (origin === target) {
          return count;
        }
        return count + 1;
      }

      // それ以外のファイルはスキップ
      showSkipped &&
        console.log(`SKIPPING ${fullPath} BECAUSE IT'S NOT A TARGET FILE`);
      return await completedCount;
    } catch (e) {
      console.error(`FAILED TO ARRANGE ${fullPath}`);
      console.error(e);
      // throw e;
    }

    return await completedCount;
  }, new Promise<number>((resolve) => setTimeout(() => resolve(0), 1)));
};
