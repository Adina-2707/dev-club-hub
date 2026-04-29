require('dotenv').config();
const { query } = require('./db');

async function test() {
  try {
    const result = await query('SELECT 1 AS value');
    console.log(result.rows);
  } catch (err) {
    console.error('Connection test failed:', err);
    process.exit(1);
  }
}

test();
