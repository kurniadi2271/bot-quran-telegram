const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const cron = require("node-cron");
require("dotenv").config();

const pool = require("./db");

const bot = new TelegramBot(process.env.TOKEN, {
  polling: true,
});

console.log("🔥 BOT STARTED");

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const fullName = [msg.from.first_name, msg.from.last_name]
    .filter(Boolean)
    .join(" ");
  const username = msg.from.username || null;

  await pool.query(
    `
    INSERT INTO users(chat_id, full_name, username)
    VALUES($1, $2, $3)
    ON CONFLICT(chat_id)
    DO UPDATE SET full_name = EXCLUDED.full_name, username = EXCLUDED.username
    `,
    [chatId, fullName, username]
  );

  bot.sendMessage(
    chatId,
    "✅ Subscribe berhasil"
  );
});

bot.onText(/\/stop/, async (msg) => {
  const chatId = msg.chat.id;

  await pool.query(
    `DELETE FROM users WHERE chat_id=$1`,
    [chatId]
  );

  bot.sendMessage(chatId, "❌ Unsubscribe berhasil");
});

// Show API data (fetch a random ayat and display formatted message)
bot.onText(/\/api/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const res = await axios.get(
      "https://api.ahmadsanusi.com/v1/quran/acak",
      {
        headers: { "X-API-Key": process.env.API_KEY },
      }
    );

    const data = res.data.data;

    // fetch surah list to map name
    const surahRes = await axios.get(
      "https://api.ahmadsanusi.com/v1/quran/surah",
      { headers: { "X-API-Key": process.env.API_KEY } }
    );

    const surahMap = {};
    surahRes.data.data.forEach((s) => {
      surahMap[s.id] = s.name_id;
    });

    const pesan = `📖 *Ayat Al-Qur'an (API)*\n\n
    *Surah:* ${surahMap[data.surah_id] || data.surah_id}\n
    *Ayat:* ${data.ayah_number}\n\n${data.arabic}\n\n
    🇮🇩 *Terjemahan*\n${data.translation_id}\n\n
    *Tafsir Quraish*\n${data.tafsir_quraish || "-"}\n\n
    *Asbabun Nuzul*\n${data.asbabun_nuzul || "Tidak tersedia"}`;
    
    const result = await pool.query(`SELECT chat_id FROM users`);
    
    for (const row of result.rows) {
      const chatId = row.chat_id;
      try {
        if (data.image) {
          await bot.sendPhoto(chatId, data.image);
        }

        await bot.sendMessage(chatId, pesan, { parse_mode: "Markdown" });

        if (data.audio?.alafasy) {
          await bot.sendAudio(chatId, data.audio.alafasy, {
            caption: `🎧 Murottal ${surahMap[data.surah_id] || ''} Ayat ${data.ayah_number}`,
          });
        }

        console.log(`✅ Sent to ${chatId}`);
      } catch (err) {
        console.log(`❌ Failed ${chatId}:`, err.message);
      }
    }

    await bot.sendMessage(chatId, pesan, { parse_mode: "Markdown" });
  } catch (err) {
    console.log(err.message);
    bot.sendMessage(chatId, "Gagal mengambil data dari API: " + err.message);
  }
});

// helper: get surah map (cached)
let surahMapCache = null;
async function getSurahMap() {
  if (surahMapCache) return surahMapCache;

  try {
    const surahRes = await axios.get(
      "https://api.ahmadsanusi.com/v1/quran/surah",
      { headers: { "X-API-Key": process.env.API_KEY } }
    );

    const map = {};
    surahRes.data.data.forEach((s) => {
      map[s.id] = s.name_id;
    });

    surahMapCache = map;
    return map;
  } catch (err) {
    console.log("Failed load surah list:", err.message);
    return {};
  }
}

// send a random ayat to all users
async function sendDailyAyat() {
  try {
    const res = await axios.get(
      "https://api.ahmadsanusi.com/v1/quran/acak",
      { headers: { "X-API-Key": process.env.API_KEY } }
    );

    const data = res.data.data;
    const surahMap = await getSurahMap();

    const pesan = `📖 *Ayat Al-Qur'an Harian*\n\n
    *Surah:* ${surahMap[data.surah_id] || data.surah_id}\n
    *Ayat:* ${data.ayah_number}\n\n${data.arabic}\n\n
    🇮🇩 *Terjemahan*\n${data.translation_id}\n\n
    *Tafsir Quraish*\n${data.tafsir_quraish || "-"}\n\n
    *Asbabun Nuzul*\n${data.asbabun_nuzul || "Tidak tersedia"}`;

    const result = await pool.query(`SELECT chat_id FROM users`);

    for (const row of result.rows) {
      const chatId = row.chat_id;
      try {
        if (data.image) {
          await bot.sendPhoto(chatId, data.image);
        }

        await bot.sendMessage(chatId, pesan, { parse_mode: "Markdown" });

        if (data.audio?.alafasy) {
          await bot.sendAudio(chatId, data.audio.alafasy, {
            caption: `🎧 Murottal ${surahMap[data.surah_id] || ''} Ayat ${data.ayah_number}`,
          });
        }

        console.log(`✅ Sent to ${chatId}`);
      } catch (err) {
        console.log(`❌ Failed ${chatId}:`, err.message);
      }
    }
  } catch (err) {
    console.log("Failed to send daily ayat:", err.message);
  }
}

// schedule daily at 07:00 (use CRON_TZ env or default to Asia/Jakarta)
cron.schedule(
  "0 7 * * *",
  async () => {
    console.log("⏰ Running scheduled daily ayat send (07:00)");
    await sendDailyAyat();
  },
  { timezone: process.env.CRON_TZ || "Asia/Jakarta" }
);

module.exports = bot;