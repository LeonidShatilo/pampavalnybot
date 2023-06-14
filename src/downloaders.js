import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';
import { TTScraper } from 'tiktok-scraper-ts';
import { readFile } from 'fs/promises';

import { errorLogger } from './errorLogger.js';

ffmpeg.setFfmpegPath(installer.path);

export const getVideoData = async ({ ctx, url }) => {
  try {
    const TikTokScraper = new TTScraper();
    const result = await TikTokScraper.video(url, true);

    return result;
  } catch (error) {
    errorLogger('downloaders.getVideoData', error, ctx);
  }
};

export const downloadVideo = async ({ ctx, filePath, url }) => {
  try {
    const ffmpegProcess = ffmpeg(url)
      .outputOptions('-crf 30')
      .outputOptions('-preset veryfast')
      .outputOptions('-movflags +faststart')
      .outputOptions('-vf', 'scale=iw/2:-1')
      .outputOptions('-c:v', 'libx264')
      .outputFormat('mp4')
      .save(filePath);

    await new Promise((resolve, reject) => {
      ffmpegProcess.on('end', () => {
        resolve();
      });

      ffmpegProcess.on('error', (error) => {
        reject(error);
      });
    });

    return await readFile(filePath);
  } catch (error) {
    errorLogger('downloaders.downloadVideo', error, ctx);
  }
};
