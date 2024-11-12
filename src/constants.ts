// enables debug mode
export const IS_DEBUG_MODE = process.env.DEBUG === 'true';

export const MODE: 'dry-run' | 'move' =
  process.env.MODE === 'move' ? 'move' : 'dry-run';

// from environment variables
export const TARGET_DIR = process.env.TARGET_DIR || '/target';
export const TARGET_FILENAME =
  process.env.TARGET_FILENAME || '%filename%.%ext%';
export const SOURCE_DIR = process.env.SOURCE_DIR || '/source';
export const MAX_PARALLEL = Number(process.env.MAX_PARALLEL) || 3;

// 付随するファイルのサフィックス
export const XML_SUFFIX = 'M01.XML';
export const METADATA_SUFFIX = [XML_SUFFIX, '.XMP'];

// ファイル名の正規表現
export const MOVIE_FILE_REGEX = /\.(?:mp4|mov)$/iu;
export const IMAGE_FILE_REGEX =
  /\.(?:jpg|jpeg|heif|heic|hif|png|arw|dng|tif)$/iu;
export const DELETING_FILE_REGEX = /^$/iu;
export const SKIPPING_FILE_REGEX = /^(?:@eaDir|\..*|sub)$/iu;
export const SKIPPING_DIR_REGEX = /^(?:)$/iu;
export const IGNORABLE_FILE_REGEX =
  /^(?:@eaDir|\.DS_Store|\._.*|(DATABASE|STATUS)\.BIN|Thumbs.db)$/iu;
