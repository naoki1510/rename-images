import fs from 'fs/promises';

const CHUNK_SIZE = 1 << 20;

/**
 * 2 つのファイルの中身がバイト単位で一致するかを調べる
 * @param a ファイルのフルパス
 * @param b ファイルのフルパス
 * @returns 一致すれば true
 */
export const isSameFile = async (a: string, b: string) => {
  const [statA, statB] = await Promise.all([fs.stat(a), fs.stat(b)]);
  if (statA.size !== statB.size) {
    return false;
  }

  const fileA = await fs.open(a);
  try {
    const fileB = await fs.open(b);
    try {
      return await compare(fileA, fileB, statA.size);
    } finally {
      await fileB.close();
    }
  } finally {
    await fileA.close();
  }
};

const compare = async (
  fileA: fs.FileHandle,
  fileB: fs.FileHandle,
  size: number
) => {
  const bufA = Buffer.alloc(CHUNK_SIZE);
  const bufB = Buffer.alloc(CHUNK_SIZE);
  for (let pos = 0; pos < size; pos += CHUNK_SIZE) {
    const length = Math.min(CHUNK_SIZE, size - pos);
    const [readA, readB] = await Promise.all([
      fileA.read(bufA, 0, length, pos),
      fileB.read(bufB, 0, length, pos),
    ]);
    // 読み切れなかったときは一致を確かめられないので、別物として扱う
    if (readA.bytesRead !== length || readB.bytesRead !== length) {
      return false;
    }
    if (!bufA.subarray(0, length).equals(bufB.subarray(0, length))) {
      return false;
    }
  }
  return true;
};
