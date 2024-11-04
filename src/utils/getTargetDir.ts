import { TARGET_PATH } from "../constants";

/**
 * 画像ファイルの移動先ディレクトリを取得する
 * @param info
 */
export const getTargetDir = (info: {
  date: Date;
  model?: string;
  lens?: string;
}) => {
  const { date, model = "", lens = "" } = info;
  const year = date.getFullYear();
  const yearStr = date ? String(year).padStart(4, "0") : "";
  const month = date.getMonth() + 1;
  const monthStr = date ? String(month).padStart(2, "0") : "";
  const day = date.getDate();
  const dayStr = date ? String(day).padStart(2, "0") : "";

  return TARGET_PATH.replaceAll(/%year%/ig, yearStr)
    .replaceAll(/%month%/ig, monthStr)
    .replaceAll(/%day%/ig, dayStr)
    .replaceAll(/%model%/ig, model)
    .replaceAll(/%lens%/ig, lens);
};
