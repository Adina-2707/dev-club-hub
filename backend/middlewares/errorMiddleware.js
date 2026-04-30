const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err);

  res.status(statusCode).json(errorResponse(err.message || 'Internal Server Error'));
};

module.exports = errorHandler;
