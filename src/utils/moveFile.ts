import fs from "fs";

/**
 * ファイルを移動する
 * @param file 移動するファイル名
 * @param dirPath 移動元ディレクトリのフルパス
 * @param targetPath 移動先ディレクトリのフルパス
 * @returns 移動元と移動先のファイルパス
 */
export const moveFile = async (
  file: string,
  dirPath: string,
  targetPath: string
) => {
  const { name = file, ext = "" } =
    file.match(/(?<name>.+)\.(?<ext>.+)$/u)?.groups || {};
  const origin = `${dirPath}/${file}`;
  let target = targetPath
    .replaceAll(/%filename%/gi, name)
    .replaceAll(/%ext%/gi, ext);

  const dir = targetPath.replace(/\/[^/]*$/, "");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 移動先が同じ場合は何もしない
  if (origin === target) {
    console.log(`SKIPPED: ${origin} -> ${target} (SAME PATH)`);
    return { origin, target };
  }

  if (fs.existsSync(`${target}`)) {
    let i = 1;
    do {
      target = targetPath
        .replaceAll(/%filename%/gi, `${name} (${i})`)
        .replaceAll(/%ext%/gi, ext);
    } while (fs.existsSync(`${target}`));
  }

  const xmlFile = `${dirPath}/${name}M01.XML`;
  if (fs.existsSync(xmlFile)) {
    await move(xmlFile, target.replace(new RegExp(`\\.${ext}$`), "M01.XML"));
  }

  return move(origin, target).then((result) => {
    return result;
  });
};

async function move(origin: string, target: string) {
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
