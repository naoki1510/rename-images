import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { getTargetDir } from './getTargetDir.js';
import { moveFile } from './moveFile.js';
import { IS_DEBUG_MODE, XML_SUFFIX } from '../constants.js';
import { XMLParser } from 'fast-xml-parser';
import { readFileAsync } from './fsWrap/readFileAsync.js';

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
      readFileAsync(xmlPath, {
        encoding: 'utf-8',
      }).then((xml) => {
        const parser = new XMLParser({ ignoreAttributes: false });
        const parsedXml = parser.parse(xml) as {
          NonRealTimeMeta: {
            CreationDate: {
              '@_value': string;
            };
            Device: {
              '@_modelName': string;
            };
          };
        };
        if (IS_DEBUG_MODE) {
          console.log(parsedXml.NonRealTimeMeta.CreationDate['@_value']);
          console.log(parsedXml.NonRealTimeMeta.Device['@_modelName']);
        }
        const date = new Date(
          parsedXml.NonRealTimeMeta.CreationDate['@_value']
        );
        const model = parsedXml.NonRealTimeMeta.Device['@_modelName'];

        resolve({ date, model });
      }).catch((err: Error) => {
        reject(err);
      });
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
