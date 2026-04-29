const { query } = require('../db');

const getAllUsers = async () => {
  const result = await query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
  return result.rows;
};

const getUserById = async (id) => {
  const result = await query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

const getUserByEmail = async (email) => {
  const result = await query('SELECT id, name, email, role, password, created_at FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

const createUser = async ({ name, email, role }) => {
  const result = await query(
    'INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at',
    [name, email, role],
  );
  return result.rows[0];
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
};
