const pool = require("./db");

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      chat_id BIGINT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("✅ Database ready");
}

init();