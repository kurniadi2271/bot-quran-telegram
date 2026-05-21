# BotTelegram

BotTelegram is a Node.js Telegram bot that sends a daily random Ayat Al-Qur'an message to subscribed users.

## Features

- Sends one daily Quran verse with translation, tafsir, and asbabun nuzul
- Automatically delivers messages to subscribers every day at 07:00
- Supports `/start` to subscribe and `/stop` to unsubscribe

## Requirements

- Node.js 18+ (or compatible)
- A Telegram bot token
- API key for `https://api.ahmadsanusi.com/v1/quran`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root with:

```env
TOKEN=your_telegram_bot_token
API_KEY=your_api_key
```

3. Start the bot:

```bash
node index.js
```

## Usage

- Send `/start` to the bot to subscribe
- Send `/stop` to unsubscribe
- Bot address: [t.me/joybringer2026_bot](https://t.me/joybringer2026_bot)

Subscribed users will receive the daily ayat message at 07:00 local server time.

## Files

- `index.js` - bot implementation
- `package.json` - project metadata and dependencies
- `users.json` - subscriber storage (created automatically)

## Dependencies

- `node-telegram-bot-api`
- `axios`
- `dotenv`
- `node-cron`
