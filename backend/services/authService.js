const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');
const { getUserByEmail, createUser } = require('./userService');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'devclub_jwt_secret';
  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET is not configured; using fallback signing key. Set JWT_SECRET in environment for production.');
  }

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    {
      expiresIn: '1h',
    },
  );
};

const registerUser = async ({ name, email, password, role = 'student' }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await getUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new AppError('Email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser({ name: name.trim(), email: normalizedEmail, role, password: hashedPassword });
  const token = generateToken(user);
  return { user, token };
};

const authenticateUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await getUserByEmail(normalizedEmail);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  const { password: _, ...safeUser } = user;
  const token = generateToken(safeUser);
  return { user: safeUser, token };
};

module.exports = {
  generateToken,
  registerUser,
  authenticateUser,
};
