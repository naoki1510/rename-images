import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { getTargetDir } from './getTargetDir';
import { moveFile } from './moveFile';
import { XML_SUFFIX } from '../constants';
import { XMLParser } from 'fast-xml-parser';

/**
 * 画像ファイルを整理する
 * @param dirPath ファイルが存在するディレクトリのフルパス
 * @param file 整理するファイル名
 * @returns 移動元と移動先のファイルパス
 */
export const arrangeMovie = async (dirPath: string, file: string) => {
  const { date, model } = await getVideoMeta(`${dirPath}/${file}`);

  const targetDirPath = getTargetDir({
    date,
    model,
  });

  return moveFile(file, dirPath, targetDirPath);
};

function getVideoMeta(filePath: string) {
  return new Promise<{ date: Date; model?: string }>((resolve, reject) => {
    const xmlPath = filePath.replace(/\..*$/, XML_SUFFIX);
    if (fs.existsSync(xmlPath) === true) {
      const xml = fs.readFileSync(xmlPath, {
        encoding: 'utf-8',
      });
      const parser = new XMLParser({ ignoreAttributes: false });
      const parsedXml = parser.parse(xml) as object;
      console.log(parsedXml);
      // TODO: XMLから撮影日時とモデル名を取得する
      console.log('Todo: XMLから撮影日時とモデル名を取得する');
      process.exit(1);
    } else {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          console.error(err);
          reject(new Error('動画のメタデータが取得できませんでした'));
        } else {
          // creation_timeが含まれているか確認
          const creationTime = metadata.format.tags
            ? metadata.format.tags.creation_time
            : null;

          if (creationTime) {
            // 日本時間に変換
            const date = new Date(
              Number(new Date(creationTime || '')) + 9 * 60 * 60 * 1000
            );
            resolve({ date });
          } else {
            reject(new Error('撮影日が取得できませんでした'));
          }
        }
      });
    }
  });
}
