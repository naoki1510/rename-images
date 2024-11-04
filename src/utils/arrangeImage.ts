import { getExif } from "./getExif";
import { getTargetDir } from "./getTargetDir";
import { moveFile } from "./moveFile";

/**
 * 画像ファイルを整理する
 * @param dirPath ファイルが存在するディレクトリのフルパス
 * @param file 整理するファイル名
 * @returns 移動元と移動先のファイルパス
 */
export const arrangeImage = (dirPath: string, file: string) => {
  const tags = getExif(`${dirPath}/${file}`);

  const dateTag = tags["DateTimeOriginal"];

  const date = new Date(
    dateTag?.description.replace(
      /(?<year>\d{4}):(?<month>\d{2}):(?<date>\d{2}) (?<hour>\d{2}):(?<min>\d{2}):(?<sec>\d{2})/u,
      "$<year>-$<month>-$<date> $<hour>:$<min>:$<sec>"
    ) || NaN
  );

  const model = tags["Model"]?.description;
  const lens = tags["LensModel"]?.description;

  const targetDirPath = getTargetDir({
    date,
    model,
    lens,
  });

  return moveFile(file, dirPath, targetDirPath);
};
