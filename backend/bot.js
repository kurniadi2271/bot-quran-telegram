const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const pool = require("./db");

const bot = new TelegramBot(process.env.TOKEN, {
  polling: true,
});

console.log("🔥 BOT STARTED");

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  await pool.query(
    `
    INSERT INTO users(chat_id)
    VALUES($1)
    ON CONFLICT(chat_id)
    DO NOTHING
    `,
    [chatId]
  );

  bot.sendMessage(chatId, "✅ Subscribe berhasil");
});

bot.onText(/\/stop/, async (msg) => {
  const chatId = msg.chat.id;

  await pool.query(
    `DELETE FROM users WHERE chat_id=$1`,
    [chatId]
  );

  bot.sendMessage(chatId, "❌ Unsubscribe berhasil");
});

module.exports = bot;