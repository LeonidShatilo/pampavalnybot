import fs from 'fs';
import { dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { unlink } from 'fs/promises';

import { errorLogger } from './errorLogger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const escapeMarkdown = (text) => {
  const charactersToEscape = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];

  return text
    .split('')
    .map((char) => (charactersToEscape.includes(char) ? `\\${char}` : char))
    .join('');
};

export const escapeUrl = (url) => url.replace(/\\/g, '\\').replace(/\)/g, '\\)');

export const markdownLink = (text, url) => {
  const escapedText = escapeMarkdown(text);
  const escapedUrl = escapeUrl(url);

  return `[${escapedText}](${escapedUrl})`;
};

export const removeFile = async ({ ctx, filePath }) => {
  try {
    await unlink(filePath);
  } catch (error) {
    await errorLogger('utils.removeFile', error, ctx);
  }
};

export const logger = ({ ctx, url }) => {
  console.log(' ');
  console.log(`>>> [${ctx.from?.id}]: ${url}`);
  console.log(' ');
};

export const clearAssets = () => {
  const assetsDirectory = resolve(__dirname, '../assets');

  if (!fs.existsSync(assetsDirectory)) {
    fs.mkdirSync(assetsDirectory);
    console.log('Assets directory has been created.');

    return;
  }

  fs.readdir(assetsDirectory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);

      return;
    }

    if (files.length === 0) {
      console.log('Assets directory is empty. No files to delete.');

      return;
    }

    files.forEach((file) => {
      const filePath = join(assetsDirectory, file);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);

          return;
        }

        console.log('File deleted:', filePath);
      });
    });
  });
};
