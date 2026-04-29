require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query } = require('./db');

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  try {
    await query(sql);

    const passwordColumn = await query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password'",
    );
    if (passwordColumn.rowCount === 0) {
      await query("ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT ''");
      console.log('Added missing password column to users table');
    }

    console.log('Schema created successfully');
  } catch (err) {
    console.error('Schema creation failed:', err);
    process.exit(1);
  }
}

run();
