const dotenv = require('dotenv');
const { Pool } = require('pg');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

(async () => {
  try {
    const res = await pool.query('SELECT id, email, role FROM users WHERE email=$1', ['adinatest43@gmail.com']);
    if (res.rows.length === 0) {
      console.log('NOT_FOUND - User does not exist in database');
    } else {
      console.log('FOUND:', res.rows[0]);
    }
  } catch (e) {
    console.error('ERR', e.message);
  } finally {
    await pool.end();
  }
})();
