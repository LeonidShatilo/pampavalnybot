import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import TikChan from 'tikchan';

import { auth } from './auth.js';
import { errorLogger } from './errorLogger.js';

import { TELEGRAM_TOKEN } from './constants.js';

const bot = new Telegraf(TELEGRAM_TOKEN);

bot.use(auth());

bot.telegram.setMyCommands([{ command: 'start', description: 'Запустить бота' }]);

bot.command('start', async (ctx) => {
  await ctx.reply('Привет! Отправьте мне ссылку на видео из TikTok.');
});

bot.on(message('text'), async (ctx) => {
  const link = ctx.message.text;
  const isTikTokLink = link.includes('tiktok.com');

  if (!isTikTokLink) {
    await ctx.reply('Я поддерживаю скачивание видео только из TikTok. Пожалуйста, отправьте мне валидную ссылку.');

    return;
  }

  try {
    const result = await TikChan.download(link);

    await ctx.telegram.sendChatAction(ctx.chat.id, 'upload_video');
    await ctx.replyWithVideo(result.no_wm);
  } catch (error) {
    errorLogger('bot.message.text', error, ctx);
  }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
