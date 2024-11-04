import ExifReader from "exifreader";
import fs from "fs";

/**
 * Exif情報を取得する
 * @param filePath ファイルのフルパス
 * @returns Exifのタグ情報
 */
export const getExif = (filePath: string) => {
  const data = fs.readFileSync(filePath);
  const tags = ExifReader.load(data);
  return tags;
};
