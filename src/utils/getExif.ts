import ExifReader from 'exifreader';
import { readFileAsync } from './fsWrap/readFileAsync.js';

/**
 * Exif情報を取得する
 * @param filePath ファイルのフルパス
 * @returns Exifのタグ情報
 */
export const getExif = async (filePath: string) => {
  const data = await readFileAsync(filePath);
  const tags = ExifReader.load(data);
  return tags;
};
