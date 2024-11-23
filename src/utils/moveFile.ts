import fs from 'fs';
import { moveAsync, MoveResult } from './fsWrap/moveAsync.js';
import { METADATA_SUFFIX } from '../constants.js';

const confirming: Promise<boolean | symbol>[] = [];

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
): Promise<MoveResult> => {
  const { name = file, ext = '' } =
    file.match(/(?<name>.+)\.(?<ext>.+)$/u)?.groups || {};
  const origin = `${dirPath}/${file}`;
  let target = targetPath
    .replaceAll(/%filename%/gi, name)
    .replaceAll(/%ext%/gi, ext);

  let i = 1;
  while (fs.existsSync(`${target}`)) {
    target = target.replace(/(?<ext>\..*)$/iu, ` (${i})$<ext>`);
    i++;
    const { confirm } = await import('@clack/prompts');
    while (confirming.length > 0) {
      await Promise.race(confirming);
    }
    const cfm = confirm({
      message: `${target} already exists. Would you like to rename it to ${target}?`,
    });
    confirming.push(cfm);
    const res = await cfm;
    void confirming.splice(confirming.indexOf(cfm), 1);
    if (!res) {
      //throw new Error('File already exists');
      return { origin, target, status: 'SKIPPED' };
    }
  }

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

  // プロキシファイルが存在する場合は同時に移動
  const proxyPath = `${dirPath.replace(/CLIP/, '')}SUB/${name}S03.MP4`;
  if (fs.existsSync(proxyPath)) {
    await moveAsync(
      proxyPath,
      target.replace(/\/[^/]*$/, `SUB/${name}S03.MP4`)
    );
  }

  return moveAsync(origin, target).then((result) => {
    return result;
  });
};
