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
 
---

## Project structure

- `backend/` - Express API + Telegram bot server (Postgres-backed)
- `dashboard/` - React + Vite dashboard (subscriber overview)

## Quickstart (local)

1. Install dependencies for backend and dashboard:

```powershell
cd backend
npm install

cd ../dashboard
npm install
```

2. Create a `.env` in the project root (or configure environment variables).
Required variables (backend):

```
TOKEN=your_telegram_bot_token
API_KEY=your_ahmadsanusi_api_key
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
VITE_API_URL=http://localhost:3000   # used by dashboard in dev
# Optional: set timezone for cron (defaults to Asia/Jakarta)
CRON_TZ=Asia/Jakarta
```

3. Initialize / migrate the database (creates `users` table and columns):

```powershell
cd backend
node initDb.js
```

Alternatively run SQL manually in Postgres:

```sql
CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	chat_id BIGINT UNIQUE NOT NULL,
	full_name TEXT,
	username TEXT,
	created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
```

4. Run the backend server (starts bot and API):

```powershell
cd backend
node index.js
```

You should see logs like `🔥 BOT STARTED` and `API running`.

5. Run the dashboard (dev):

```powershell
cd dashboard
npm run dev
```

Open the dashboard in the browser (Vite will print URL — default is http://localhost:5173).

## Bot commands

- `/start` — subscribe (saves `chat_id`, `full_name`, `username`)
- `/stop` — unsubscribe
- `/api` — fetch and show a random ayat from the external API (for testing)

The bot automatically sends one random ayat daily at 07:00 (server time) via `node-cron`.

## API Endpoints (backend)

- `GET /stats` — returns `{ total: <count> }` of subscribers
- `GET /users` — returns `users` rows (includes `full_name`, `username`, `chat_id`, `created_at`)

## Database notes

- The `users` table stores subscribers. If you change schema, re-run `node initDb.js` or apply SQL manually.
- Add an index on `username` if you will search by username frequently:

```sql
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
```

## Security

- Do not commit `.env` to version control. Keep `TOKEN` and `API_KEY` secret.
- If deploying to a host (Railway, Heroku, etc.), set the env vars in the host settings.

## Troubleshooting

- If cron doesn't appear to run, check server timezone and `CRON_TZ` env var.
- Check logs for errors when sending messages — invalid chat IDs or API failures will be logged.

## Next steps / ideas

- Add pagination and CSV export to the dashboard.
- Add delivery retry and failure logging to DB.
- Add admin-only commands to preview next scheduled ayat.

---

If you want, I can commit this README and run `node initDb.js` for you locally — should I proceed?
