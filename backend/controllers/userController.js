const AppError = require('../errors/AppError');
const { getAllUsers, getUserById, createUser } = require('../services/userService');
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

const createUserHandler = async (req, res) => {
  const { name, email, role } = req.body;
  const user = await createUser({
    name,
    email,
    role: role || 'student',
  });
  res.status(201).json(successResponse(user));
};

module.exports = {
  listUsers,
  getUser,
  createUserHandler,
};
