import { code } from 'telegraf/format';

import { ERROR_LOG_VIEWERS_USER_IDS } from './constants.js';

export const errorLogger = async (initiator, error, ctx) => {
  const userId = ctx.from?.id;
  const errorName = error.name ?? 'Error';
  const errorMessage = `${errorName}: ${error.message}\nInitiator: ${initiator}`;

  if (userId && ERROR_LOG_VIEWERS_USER_IDS.includes(userId)) {
    await ctx.reply(code(errorMessage));
  }

  console.error(errorMessage);
};
