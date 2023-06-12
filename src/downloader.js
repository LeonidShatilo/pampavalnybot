import { TTScraper } from 'tiktok-scraper-ts';

import { errorLogger } from './errorLogger.js';

export const getVideoData = async ({ ctx, url }) => {
  await ctx.telegram.sendChatAction(ctx.chat.id, 'upload_video');

  try {
    const TikTokScraper = new TTScraper();
    const result = await TikTokScraper.video(url, true);

    return result;
  } catch (error) {
    errorLogger('downloader.getVideoData', error, ctx);
  }
};
