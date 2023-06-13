import express from 'express';
import { Telegraf } from 'telegraf';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { message } from 'telegraf/filters';

import { auth } from './auth.js';
import { errorLogger } from './errorLogger.js';
import { downloadVideo, getVideoData } from './downloaders.js';
import { markdownLink, logger, removeFile } from './utils.js';

import { DEFAULT_ERROR_MESSAGE, PORT, TELEGRAM_TOKEN, TIKTOK_URLS, WEBHOOK_URL } from './constants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

const bot = new Telegraf(TELEGRAM_TOKEN);

app.use(bot.webhookCallback());

bot.telegram.setWebhook(WEBHOOK_URL).then(() => console.log('Webhook has been set successfully.'));

bot.use(auth());

bot.telegram.setMyCommands([{ command: 'start', description: 'Запустить бота' }]);

bot.command('start', async (ctx) => {
  await ctx.reply('Привет! Отправь мне ссылку на видео из TikTok.');
});

bot.on(message('text'), async (ctx) => {
  const url = ctx.message.text;
  const isTikTokUrl = TIKTOK_URLS.some((tiktokUrl) => url.startsWith(tiktokUrl));

  if (!isTikTokUrl) {
    await ctx.reply('Я поддерживаю скачивание видео только из TikTok. Пожалуйста, отправь мне валидную ссылку.');

    return;
  }

  const videoData = await getVideoData({ ctx, url });
  const playVideoUrl = videoData?.playURL;
  const id = videoData?.id;
  const author = videoData?.author;
  const authorLink = markdownLink(author, `https://www.tiktok.com/@${author}`);
  const directVideoLink = markdownLink('Direct Link', videoData?.directVideoUrl);
  const caption = `👤 ${authorLink}\n\n▶️ ${directVideoLink}`;

  logger({ ctx, url: videoData?.directVideoUrl });

  try {
    const filePath = resolve(__dirname, '../assets', `${id}_${Date.now()}.mp4`);
    const downloadedVideoPath = await downloadVideo({ ctx, filePath, url: playVideoUrl });

    await ctx.telegram.sendChatAction(ctx.chat.id, 'upload_video');
    await ctx.replyWithVideo({ source: downloadedVideoPath }, { caption, parse_mode: 'MarkdownV2' });
    await removeFile({ ctx, filePath });
  } catch (error) {
    await ctx.reply(DEFAULT_ERROR_MESSAGE);
    errorLogger('bot.message.text.replyWithVideo', error, ctx);
  }
});

app.listen(PORT, () => {
  console.log(`Server has been started on ${PORT} port.`);
});

app.get('/', (req, res) => {
  res.json({
    message: 'Telegram bot is working.',
    success: true,
  });
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
