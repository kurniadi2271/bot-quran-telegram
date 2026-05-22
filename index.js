const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const cron = require("node-cron");
const fs = require("fs");

require("dotenv").config();

const bot = new TelegramBot(process.env.TOKEN, {
  polling: true,
});

let users = [];
let surahMap = {};
let cachedAyat = null;

// =====================
// LOAD USERS
// =====================
function loadUsers() {
  try {
    users = JSON.parse(
      fs.readFileSync("users.json")
    );
  } catch {
    users = [];
  }
}

// =====================
// SAVE USERS
// =====================
function saveUsers() {
  fs.writeFileSync(
    "users.json",
    JSON.stringify(users, null, 2)
  );
}

// =====================
// LOAD SURAH
// =====================
async function loadSurah() {
  try {
    const res = await axios.get(
      "https://api.ahmadsanusi.com/v1/quran/surah",
      {
        headers: {
          "X-API-Key": process.env.API_KEY,
        },
      }
    );

    res.data.data.forEach((s) => {
      surahMap[s.id] = s.name_id;
    });

    console.log("✅ Surah loaded");
  } catch (err) {
    console.log(err.message);
  }
}

// =====================
// GET RANDOM AYAT
// =====================
async function getRandomAyat() {
  try {
    const res = await axios.get(
      "https://api.ahmadsanusi.com/v1/quran/acak",
      {
        headers: {
          "X-API-Key": process.env.API_KEY,
        },
      }
    );

    cachedAyat = res.data.data;

    console.log("✅ Ayat cached");
  } catch (err) {
    console.log(err.message);
  }
}

// =====================
// FORMAT MESSAGE
// =====================
function formatPesan(data) {
  return `
📖 *Ayat Al-Qur'an Harian*

🕌 *Surah:* ${surahMap[data.surah_id]}
🔢 *Ayat:* ${data.ayah_number}

${data.arabic}

🇮🇩 *Terjemahan*
${data.translation_id}

📚 *Tafsir Quraish*
${data.tafsir_quraish || "-"}

📝 *Asbabun Nuzul*
${data.asbabun_nuzul || "Tidak tersedia"}
`;
}

// =====================
// SEND TO ALL USERS
// =====================
async function kirimKeSemua() {
  if (!cachedAyat) return;

  const pesan = formatPesan(cachedAyat);

  for (const chatId of users) {
    try {
      // gambar
      if (cachedAyat.image) {
        await bot.sendPhoto(
          chatId,
          cachedAyat.image
        );
      }

      // text
      await bot.sendMessage(chatId, pesan, {
        parse_mode: "Markdown",
      });

      // audio
      if (cachedAyat.audio?.alafasy) {
        await bot.sendAudio(
          chatId,
          cachedAyat.audio.alafasy,
          {
            caption: `🎧 Murottal ${surahMap[cachedAyat.surah_id]} Ayat ${cachedAyat.ayah_number}`,
          }
        );
      }

      console.log(`✅ Sent to ${chatId}`);
    } catch (err) {
      console.log(`❌ Failed ${chatId}`);
    }
  }
}

// =====================
// AUTO SUBSCRIBE
// =====================
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  if (!users.includes(chatId)) {
    users.push(chatId);
    saveUsers();
  }

  bot.sendMessage(
    chatId,
    `✅ Kamu berhasil subscribe

Bot akan mengirim ayat Al-Qur'an setiap hari secara otomatis.

Ketik /stop untuk berhenti subscribe.`
  );
});

// =====================
// UNSUBSCRIBE
// =====================
bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;

  users = users.filter((id) => id !== chatId);

  saveUsers();

  bot.sendMessage(
    chatId,
    "❌ Kamu berhasil unsubscribe"
  );
});

// =====================
// CRON DAILY
// =====================

// tiap hari jam 07:00
cron.schedule(
  "0 7 * * *",
  async () => {
    console.log("⏰ Sending daily ayat");

    await getRandomAyat();
    await kirimKeSemua();
  },
  {
    timezone: "Asia/Jakarta",
  }
);

// =====================
// INIT
// =====================
(async () => {
  loadUsers();

  await loadSurah();

  console.log("🚀 Bot running");
})();