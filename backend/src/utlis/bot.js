const TelegramBot = require('node-telegram-bot-api');

let bot = null;

if (process.env.TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
  console.log('🤖 Telegram Bot initialized');
}

const getAdminIds = () => {
  return (process.env.TELEGRAM_ADMIN_IDS || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);
};

const notifyAdmins = async (message) => {
  if (!bot) return;
  const adminIds = getAdminIds();
  for (const adminId of adminIds) {
    try {
      await bot.sendMessage(adminId, message, { parse_mode: 'HTML' });
    } catch (err) {
      console.error(`Failed to notify admin ${adminId}:`, err.message);
    }
  }
};

const sendMessage = async (chatId, message, options = {}) => {
  if (!bot) return;
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML', ...options });
  } catch (err) {
    console.error('Bot send error:', err.message);
  }
};

module.exports = { bot, notifyAdmins, sendMessage, getAdminIds };
