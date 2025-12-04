// server.js
import "dotenv/config";
import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // optional: max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000
});

pool.on("error", (err) => {
  console.error("Unexpected PG pool error", err);
  // consider process.exit(1) in production if desired
});

const app = express();
app.use(express.json());

// Basic health check: runs a lightweight query using pool
app.get("/healthCheck", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT $1::text as message", [
      "Hello world!",
    ]);
    return res.json({ ok: true, message: rows[0].message });
  } catch (err) {
    console.error("Health check error:", err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Users route: uses pool; no connect()/end() here
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
    return res.json(result.rows);
  } catch (err) {
    console.error("❌ USERS QUERY ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.get("/notifications", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM notifications ORDER BY created_at DESC");
    return res.json(result.rows);
  } catch (err) {
    console.error("❌ USERS QUERY ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// list of all tables
app.get("/list-all-tables", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT schemaname AS table_schema,
             tablename  AS table_name,
             tableowner AS owner
      FROM pg_tables
      ORDER BY schemaname, tablename;
    `);
    res.json(rows);
  } catch (err) {
    console.error("List tables error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// Debug route: returns connection info and whether 'users' table exists
app.get("/debug-db", async (req, res) => {
  try {
    // check connection parameters from a pooled client
    const client = await pool.connect();
    try {
      // show current DB name and user
      const { rows: infoRows } = await client.query("SELECT current_database() AS database, current_user AS user");
      // check whether 'users' exists and list schema
      const { rows: tables } = await client.query(`
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_name = 'users';
      `);
      res.json({
        connection: infoRows[0],
        users_table: tables, // empty array if none
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Debug DB error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
