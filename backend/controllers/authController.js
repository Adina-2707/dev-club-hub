const { registerUser, authenticateUser } = require('../services/authService');
const { successResponse } = require('../utils/response');

const register = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const { user, token } = await registerUser({ name, email, password, role });
  res.status(201).json(successResponse({ user, token }));
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const { user, token } = await authenticateUser({ email, password });
  res.json(successResponse({ user, token }));
};

module.exports = {
  register,
  login,
};
