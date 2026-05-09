const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

(async () => {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const res = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password RETURNING id, email, role',
      ['Adina Test', 'adinatest43@gmail.com', hashedPassword, 'student'],
    );
    console.log('upserted', res.rows[0]);
  } catch (e) {
    console.error('ERR', e.message);
  } finally {
    await pool.end();
  }
})();
