import { unlink } from 'fs/promises';

import { errorLogger } from './errorLogger.js';

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
  console.log(`>>> [${ctx.from.id}]: ${url}`);
  console.log(' ');
};
