require('dotenv').config();
const { query } = require('./db');

async function test() {
  try {
    const result = await query('SELECT id, name, email FROM users LIMIT 5');
    console.log(result.rows);
  } catch (err) {
    console.error('Connection test failed:', err);
    process.exit(1);
  }
}

test();
