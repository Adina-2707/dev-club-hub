const AppError = require('../errors/AppError');
const { getAllUsers, getUserById } = require('../services/userService');
const { successResponse } = require('../utils/response');

const listUsers = async (req, res) => {
  const users = await getAllUsers();
  res.json(successResponse(users));
};

const getUser = async (req, res, next) => {
  const { id } = req.params;
  const user = await getUserById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.json(successResponse(user));
};

module.exports = {
  listUsers,
  getUser,
};
