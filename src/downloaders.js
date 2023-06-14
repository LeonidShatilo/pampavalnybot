import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';
import { TTScraper } from 'tiktok-scraper-ts';

import { readFile, writeFile } from 'fs/promises';

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

export const downloadVideo = async ({ ctx, url, outputPath }) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const videoBuffer = Buffer.from(response.data);

    await writeFile(outputPath, videoBuffer);
  } catch (error) {
    errorLogger('downloaders.downloadVideo', error, ctx);
  }
};

export const compressVideo = async ({ ctx, inputPath, outputPath }) => {
  try {
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions('-crf 30')
        .outputOptions('-preset veryfast')
        .outputOptions('-movflags +faststart')
        .outputOptions('-vf', 'scale=iw/2:-1')
        .outputOptions('-c:v', 'libx264')
        .outputFormat('mp4')
        .save(outputPath)
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    const videoBuffer = await readFile(outputPath);
    await writeFile(outputPath, videoBuffer);
  } catch (error) {
    errorLogger('downloaders.compressVideo', error, ctx);
  }
};
