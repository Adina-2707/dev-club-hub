const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';
const useSsl = isProduction || String(connectionString).includes('railway') || process.env.PGSSLMODE === 'require';

if (!connectionString) {
  throw new Error('Missing DATABASE_URL environment variable.');
}

const pool = new Pool({
  connectionString,
  ssl: useSsl
    ? {
        rejectUnauthorized: false,
      }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(1);
});

async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('PG QUERY', { text: text.replace(/\s+/g, ' ').trim(), duration, rows: result.rowCount });
  return result;
}

module.exports = {
  pool,
  query,
};
