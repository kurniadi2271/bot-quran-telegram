const pool = require("./db");

async function init() {
  await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        chat_id BIGINT UNIQUE NOT NULL,
        full_name TEXT,
        username TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // If table existed from before, ensure new columns exist
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
  `);

  console.log("✅ Database ready");
}

init();