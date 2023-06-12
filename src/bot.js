import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import express from 'express';

import { auth } from './auth.js';
import { errorLogger } from './errorLogger.js';
import { getVideoData } from './downloader.js';

import { PORT, TELEGRAM_TOKEN, TIKTOK_URLS, WEBHOOK_URL } from './constants.js';

const app = express();

const bot = new Telegraf(TELEGRAM_TOKEN);

app.use(bot.webhookCallback());

bot.telegram.setWebhook(WEBHOOK_URL).then(() => console.log('Webhook has been set successfully.'));

bot.use(auth());

bot.telegram.setMyCommands([{ command: 'start', description: 'Запустить бота' }]);

bot.command('start', async (ctx) => {
  await ctx.reply('Привет! Отправьте мне ссылку на видео из TikTok.');
});

bot.on(message('text'), async (ctx) => {
  const url = ctx.message.text;
  const isTikTokUrl = TIKTOK_URLS.some((tiktokUrl) => url.startsWith(tiktokUrl));

  if (!isTikTokUrl) {
    await ctx.reply('Я поддерживаю скачивание видео только из TikTok. Пожалуйста, отправьте мне валидную ссылку.');

    return;
  }

  const videoData = await getVideoData({ ctx, url });
  const downloadedVideo = videoData?.playURL;
  const author = videoData?.author;
  const authorLink = link(author, `https://www.tiktok.com/@${author}`);
  const directVideoLink = link('Direct Link', videoData?.directVideoUrl);
  const caption = `👤 ${authorLink}\n\n▶️ ${directVideoLink}`;

  if (downloadedVideo) {
    await ctx.telegram.sendChatAction(ctx.chat.id, 'upload_video');
  }

  try {
    await ctx.replyWithVideo(downloadedVideo, { caption });
  } catch (error) {
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
