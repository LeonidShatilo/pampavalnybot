import express from 'express';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

import { auth } from './auth.js';
import { errorLogger } from './errorLogger.js';
import { downloadVideo, compressVideo, getVideoData } from './downloaders.js';
import { markdownLink, removeFile } from './utils.js';

import { DEFAULT_ERROR_MESSAGE, PORT, TELEGRAM_TOKEN, TIKTOK_URLS, WEBHOOK_URL } from './constants.js';

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

  if (!videoData || !videoData?.playURL) {
    await ctx.reply('Не удалось получить данные о видео. Попробуйте позже.');

    return;
  }

  const playVideoUrl = videoData?.playURL;
  const id = videoData?.id;
  const author = videoData?.author;
  const authorLink = markdownLink(author, `https://www.tiktok.com/@${author}`);
  const directVideoLink = markdownLink('Direct Link', videoData?.directVideoUrl);
  const caption = `👤 ${authorLink}\n\n▶️ ${directVideoLink}`;

  try {
    const originalFilePath = await downloadVideo({ ctx, id, url: playVideoUrl });
    const compressedFilePath = await compressVideo({ ctx, id, inputPath: originalFilePath });

    if (!originalFilePath || !compressedFilePath) {
      await ctx.reply(DEFAULT_ERROR_MESSAGE);

      return;
    }

    await ctx.telegram.sendChatAction(ctx.chat.id, 'upload_video');
    await ctx.replyWithVideo({ source: compressedFilePath }, { caption, parse_mode: 'MarkdownV2' });

    await removeFile(originalFilePath);
    await removeFile(compressedFilePath);
  } catch (error) {
    await ctx.reply(DEFAULT_ERROR_MESSAGE);
    errorLogger('bot.on.message.text', error, ctx);
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
