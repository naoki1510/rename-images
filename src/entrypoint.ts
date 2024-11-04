import { ORIGIN_PATH, TARGET_PATH } from "./constants";
import { arrangeFiles } from "./utils/arrangeFiles";
import fs from "fs";

arrangeFiles(
  ORIGIN_PATH,
  {
    picture: /(\.jpg|\.jpeg|\.heif|\.heic|\.hif|\.png|\.arw|\.dng|\.tif)$/i,
    movie: /(\.mov|\.mp4)$/i,
  },
  { showSkipped: false }
);

const renameDirs = (path: string) => {
  console.log(`Checking: ${path}`);
  const files = fs.readdirSync(path);
  files.forEach((file) => {
    const filePath = `${path}/${file}`;
    if (fs.statSync(filePath).isDirectory()) {
      const matches = filePath.match(
        /(?<year>\d{4})\/(?<month>\d{2})\/(?<day>\d{2})$/
      );
      if (matches && matches.groups) {
        const { year, month, day } = matches.groups;
        const newDir = `${TARGET_PATH}/${year}/${year}-${month}/${year}-${month}-${day}`;
        fs.mkdirSync(newDir, { recursive: true });
        fs.renameSync(filePath, newDir);
        console.log(`Renamed: ${filePath} -> ${newDir}`);
      } else if (/^(?:\d{4}|\d{2})$/.test(file)) {
        renameDirs(filePath);
      }

      if (/\d{4}\/\d{2}$/.test(filePath)) {
        console.log(
          `files in ${filePath} are ${
            fs.readdirSync(filePath).join(", ") || "empty"
          }`
        );
        try {
          fs.rmSync(filePath, { recursive: true, force: true });
          console.log(`Removed: ${filePath}`);
        } catch (e) {
          console.log(`Failed to remove: ${filePath}`);
          console.error(e);
          console.log("Retrying in 1 second...");
          setTimeout(() => {
            try {
              fs.rmSync(filePath, { recursive: true, force: true });
              console.log(`Removed: ${filePath}`);
            } catch (e) {
              console.log(`Failed to remove: ${filePath}`);
              console.error(e);
            }
          }, 1000);
        }
      }
    }
  });
};

// renameDirs(TARGET_PATH);