const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');
const { getUserById } = require('../services/userService');

const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new AppError('Authorization header missing or malformed', 401));
  }

  const token = authorization.split(' ')[1];
  if (!token) {
    return next(new AppError('Authorization token missing', 401));
  }

  try {
    const secret = process.env.JWT_SECRET || 'devclub_jwt_secret';
    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET is not configured; using fallback signing key. Set JWT_SECRET in environment for production.');
    }

    const payload = jwt.verify(token, secret);

    const user = await getUserById(payload.userId);
    if (!user) {
      return next(new AppError('Unauthorized user', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError(error.message || 'Invalid token', 401));
  }
};

module.exports = authMiddleware;
