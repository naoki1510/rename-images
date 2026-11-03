import fs from 'fs';
import { moveAsync, MoveResult } from './fsWrap/moveAsync.js';
import { isSameFile } from './isSameFile.js';
import { METADATA_SUFFIX } from '../constants.js';

/** 並列に動く他のタスクが移動先に決めたパス。存在確認から書き込みまでの間に同じ名前を取らないために使う */
const reserved = new Set<string>();

/**
 * ファイルを移動する
 *
 * 移動先に同名のファイルがあるとき、中身が同じなら移動せず、違えば ` (1)` などを付けて移動する
 * @param file 移動するファイル名
 * @param dirPath 移動元ディレクトリのフルパス
 * @param targetPath 移動先ディレクトリのフルパス
 * @param isSameShot 同名の既存ファイルが同じ撮影のものかを判定する。中身が違っても同じ撮影なら、画質違いなどの別版としてログに出す
 * @returns 移動元と移動先のファイルパス
 */
export const moveFile = async (
  file: string,
  dirPath: string,
  targetPath: string,
  isSameShot: (existing: string) => Promise<boolean>
): Promise<MoveResult> => {
  const { name = file, ext = '' } =
    file.match(/(?<name>.+)\.(?<ext>.+)$/u)?.groups || {};
  const origin = `${dirPath}/${file}`;
  const originalTarget = targetPath
    .replaceAll(/%filename%/gi, name)
    .replaceAll(/%ext%/gi, ext);
  let target = originalTarget;

  let i = 0;
  while (reserved.has(target) || fs.existsSync(target)) {
    // 予約済みのパスはまだ書き込み中かもしれないので、比べずに次の番号へ進む
    if (!reserved.has(target)) {
      if (await isSameFile(origin, target)) {
        console.log(`SKIP: ${origin} -> ${target} (SAME CONTENT)`);
        return { origin, target, status: 'SKIPPED' };
      }
      if (await isSameShot(target)) {
        console.log(`SAME SHOT: ${origin} differs from ${target}`);
      }
    }
    i++;
    target = originalTarget.replace(/(?<ext>\.[^./]*)?$/u, ` (${i})$<ext>`);
  }
  reserved.add(target);

  // 付随するファイルが存在する場合は同時に移動 (SONYのカメラで撮影した動画、Photoshopで編集した写真など)
  for (const suffix of METADATA_SUFFIX) {
    const metadata = `${dirPath}/${name}${suffix}`;
    if (fs.existsSync(metadata)) {
      await moveAsync(
        metadata,
        target.replace(new RegExp(`\\.${ext}$`), suffix)
      );
    }
  }

  // プロキシファイルが存在する場合は同時に移動。名前には本体と同じ ` (N)` を付ける
  const proxyPath = `${dirPath.replace(/CLIP/, '')}SUB/${name}S03.MP4`;
  if (fs.existsSync(proxyPath)) {
    const targetName = target.replace(/^.*\//u, '').replace(/\.[^.]*$/u, '');
    await moveAsync(
      proxyPath,
      target.replace(/\/[^/]*$/, `SUB/${targetName}S03.MP4`)
    );
  }

  return moveAsync(origin, target).then((result) => {
    return result;
  });
};
