import fs from 'fs';
import { moveAsync } from './fsWrap/moveAsync';
import { XML_SUFFIX } from '../constants';

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
  const { name = file, ext = '' } =
    file.match(/(?<name>.+)\.(?<ext>.+)$/u)?.groups || {};
  const origin = `${dirPath}/${file}`;
  let target = targetPath
    .replaceAll(/%filename%/gi, name)
    .replaceAll(/%ext%/gi, ext);

  const dir = targetPath.replace(/\/[^/]*$/, '');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let i = 1;
  while (fs.existsSync(`${target}`)) {
    target = target.replace(/(?<ext>\..*)$/iu, ` (${i})$<ext>`);
    i++;
    const { confirm } = await import('@clack/prompts');
    const res = await confirm({
      message: `${target} already exists. Would you like to rename it to ${target}?`,
    });
    if (!res) {
      throw new Error('File already exists');
    }
  }

  // XMLファイルが存在する場合は同時に移動 (SONYのカメラで撮影した動画など)
  const xmlFile = `${dirPath}/${name}${XML_SUFFIX}`;
  if (fs.existsSync(xmlFile)) {
    await moveAsync(
      xmlFile,
      target.replace(new RegExp(`\\.${ext}$`), XML_SUFFIX)
    );
  }

  return moveAsync(origin, target).then((result) => {
    return result;
  });
};
