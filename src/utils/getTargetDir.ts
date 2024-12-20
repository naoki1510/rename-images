import { TARGET_DIR, TARGET_FILENAME } from '../constants.js';

/**
 * 画像ファイルの移動先ディレクトリを取得する
 * @param info
 */
export const getTargetDir = (info: {
  date: Date;
  model?: string;
  lens?: string;
}) => {
  const { date, model = '', lens = '' } = info;
  const year = date.getFullYear();
  const yearStr = date ? String(year).padStart(4, '0') : '';
  const month = date.getMonth() + 1;
  const monthStr = date ? String(month).padStart(2, '0') : '';
  const day = date.getDate();
  const dayStr = date ? String(day).padStart(2, '0') : '';
  const hour = date.getHours();
  const hourStr = date ? String(hour).padStart(2, '0') : '';
  const minute = date.getMinutes();
  const minuteStr = date ? String(minute).padStart(2, '0') : '';

  return TARGET_DIR + TARGET_FILENAME.replaceAll(/%year%/gi, yearStr)
    .replaceAll(/%month%/gi, monthStr)
    .replaceAll(/%day%/gi, dayStr)
    .replaceAll(/%hour%/gi, hourStr)
    .replaceAll(/%minute%/gi, minuteStr)
    .replaceAll(/%model%/gi, model)
    .replaceAll(/%lens%/gi, lens);
};
