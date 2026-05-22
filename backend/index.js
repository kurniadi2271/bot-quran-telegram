const express = require("express");
const cors = require("cors");

const pool = require("./db");

// 🔥 INI PENTING (WAJIB ADA)
require("./bot");

const app = express();

app.use(cors());

app.get("/stats", async (req, res) => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM users`
  );

  res.json({
    total: result.rows[0].count,
  });
});

app.get("/users", async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM users ORDER BY id DESC`
  );

  res.json(result.rows);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("API running");
});