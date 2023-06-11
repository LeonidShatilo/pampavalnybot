import dotenv from 'dotenv';

dotenv.config();

export const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN ?? '';
export const ALLOWED_USER_IDS = process.env.ALLOWED_USER_IDS?.split(',').map((id) => Number(id)) ?? [];
export const ERROR_LOG_VIEWERS_USER_IDS =
  process.env.ERROR_LOG_VIEWERS_USER_IDS?.split(',').map((id) => Number(id)) ?? [];
export const WEBHOOK_URL = process.env.WEBHOOK_URL ?? '';
export const PORT = process.env.PORT ?? 3000;

export const DEFAULT_ERROR_MESSAGE = 'Извините, не удалось загрузить видео. Попробуйте позже.';

export const TIKTOK_URLS = ['https://www.tiktok.com/', 'https://vm.tiktok.com/', 'https://m.tiktok.com/v/'];
