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
