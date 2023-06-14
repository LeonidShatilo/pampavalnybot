import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';
import { TTScraper } from 'tiktok-scraper-ts';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { readFile, writeFile } from 'fs/promises';

import { errorLogger } from './errorLogger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

export const downloadVideo = async ({ ctx, id, url }) => {
  const originalFilePath = resolve(__dirname, '../assets', `${id}_${Date.now()}.mp4`);

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    const videoBuffer = Buffer.from(response.data);
    await writeFile(originalFilePath, videoBuffer);

    return originalFilePath;
  } catch (error) {
    errorLogger('downloaders.downloadVideo', error, ctx);
  }
};

export const compressVideo = async ({ ctx, id, inputPath }) => {
  const compressedFilePath = resolve(__dirname, '../assets', `${id}_${Date.now()}_compressed.mp4`);

  try {
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions('-crf 30')
        .outputOptions('-preset veryfast')
        .outputOptions('-movflags +faststart')
        .outputOptions('-vf', 'scale=iw/2:-1')
        .outputOptions('-c:v', 'libx264')
        .outputFormat('mp4')
        .save(compressedFilePath)
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    const videoBuffer = await readFile(compressedFilePath);
    await writeFile(compressedFilePath, videoBuffer);

    return compressedFilePath;
  } catch (error) {
    errorLogger('downloaders.compressVideo', error, ctx);
  }
};
